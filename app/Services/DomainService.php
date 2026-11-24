<?php

namespace App\Services;

use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\DispenseRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DomainService
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Trim and strip HTML tags from every string value in the array.
     */
    private function sanitize(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim(strip_tags($value));
            }
        }

        return $data;
    }

    // -------------------------------------------------------------------------
    // Patients
    // -------------------------------------------------------------------------

    public function createPatient(array $data): Patient
    {
        return Patient::create($this->sanitize($data));
    }

    public function updatePatient(Patient $patient, array $data): Patient
    {
        $patient->update($this->sanitize($data));

        return $patient->refresh();
    }

    // -------------------------------------------------------------------------
    // Doctors
    // -------------------------------------------------------------------------

    public function createDoctor(array $data): Doctor
    {
        $data = $this->sanitize($data);
        $data['doctor_license_no'] = strtoupper($data['doctor_license_no']);

        return Doctor::create($data);
    }

    public function updateDoctor(Doctor $doctor, array $data): Doctor
    {
        $data = $this->sanitize($data);
        $data['doctor_license_no'] = strtoupper($data['doctor_license_no']);
        $doctor->update($data);

        return $doctor->refresh();
    }

    // -------------------------------------------------------------------------
    // Medicines
    // -------------------------------------------------------------------------

    public function createMedicine(array $data): Medicine
    {
        $data = $this->sanitize($data);
        $data['medicine_sku'] = strtoupper($data['medicine_sku']);

        return Medicine::create($data);
    }

    public function updateMedicine(Medicine $medicine, array $data): Medicine
    {
        $data = $this->sanitize($data);
        $data['medicine_sku'] = strtoupper($data['medicine_sku']);

        return DB::transaction(function () use ($medicine, $data) {
            $locked = Medicine::query()->lockForUpdate()->findOrFail($medicine->id);
            $locked->update($data);

            return $locked->refresh();
        });
    }

    // -------------------------------------------------------------------------
    // Dispensing records
    // -------------------------------------------------------------------------

    /**
     * Create a new dispensing record and deduct stock.
     *
     * All stock deductions happen inside a single DB transaction with
     * row-level locks to prevent race conditions with concurrent requests.
     */
    public function createDispenseRecord(array $data): DispenseRecord
    {
        $data = $this->sanitize($data);

        return DB::transaction(function () use ($data) {
            // Uppercase and persist the doctor's licence number while holding
            // an exclusive row lock so no other writer can touch it.
            $doctor = Doctor::query()->lockForUpdate()->findOrFail($data['doctor_id']);
            $doctor->doctor_license_no = strtoupper(trim($doctor->doctor_license_no));
            $doctor->save();

            $record = DispenseRecord::create([
                'patient_id'   => $data['patient_id'],
                'doctor_id'    => $doctor->id,
                'dispense_date' => $data['dispense_date'],
            ]);

            // Lock all requested medicine rows in ascending id order to
            // prevent deadlocks between concurrent dispensing requests.
            $medicineIds = collect($data['items'])
                ->pluck('medicine_id')
                ->sort()
                ->values();

            $medicines = Medicine::query()
                ->whereIn('id', $medicineIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach (collect($data['items'])->sortBy('medicine_id') as $item) {
                $medicine = $medicines->get($item['medicine_id']);

                if (! $medicine) {
                    throw ValidationException::withMessages([
                        'items' => ['The selected medicine could not be found.'],
                    ]);
                }

                $quantity = (int) $item['quantity_dispensed'];

                if ($medicine->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for {$medicine->medicine_brand}. "
                            . "Available: {$medicine->stock_quantity}.",
                        ],
                    ]);
                }

                $unitPrice  = (float) $medicine->unit_price;
                $totalPrice = round($unitPrice * $quantity, 2);

                $record->items()->create([
                    'medicine_id'        => $medicine->id,
                    'quantity_dispensed' => $quantity,
                    'unit_price'         => $unitPrice,
                    'total_price'        => $totalPrice,
                ]);

                $medicine->decrement('stock_quantity', $quantity);
            }

            return $record->load(['patient', 'doctor', 'items.medicine']);
        });
    }

    /**
     * Update an existing dispensing record.
     *
     * Stock from the old items is restored first, then new items are deducted.
     * Uses withTrashed() when restoring stock so that medicine rows that have
     * been soft-deleted (e.g. discontinued stock) don't cause a 404 error.
     */
    public function updateDispenseRecord(int $id, array $data): DispenseRecord
    {
        $data = $this->sanitize($data);

        return DB::transaction(function () use ($id, $data) {
            $record = DispenseRecord::query()
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($id);

            $doctor = Doctor::query()->lockForUpdate()->findOrFail($data['doctor_id']);
            $doctor->doctor_license_no = strtoupper(trim($doctor->doctor_license_no));
            $doctor->save();

            // Collect all medicine IDs involved (old + new) and lock them in
            // ascending ID order to prevent deadlocks.
            $allMedicineIds = collect($data['items'])
                ->pluck('medicine_id')
                ->merge($record->items->pluck('medicine_id'))
                ->unique()
                ->sort()
                ->values();
            $previousMedicineIds = $record->items->pluck('medicine_id');

            $medicines = Medicine::withTrashed()
                ->whereIn('id', $allMedicineIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // ── 1. Restore stock from previous items ───────────────────────
            foreach ($record->items as $oldItem) {
                $medicine = $medicines->get($oldItem->medicine_id);

                if (! $medicine) {
                    throw ValidationException::withMessages([
                        'items' => ['A previously dispensed medicine no longer exists.'],
                    ]);
                }

                $medicine->stock_quantity += $oldItem->quantity_dispensed;
                $medicine->save();
            }

            // ── 2. Update the record header ────────────────────────────────
            $record->update([
                'patient_id'   => $data['patient_id'],
                'doctor_id'    => $doctor->id,
                'dispense_date' => $data['dispense_date'],
            ]);

            // ── 3. Replace items and deduct stock ──────────────────────────
            $record->items()->delete();

            foreach (collect($data['items'])->sortBy('medicine_id') as $item) {
                $medicine = $medicines->get($item['medicine_id']);

                if (! $medicine) {
                    throw ValidationException::withMessages([
                        'items' => ['The selected medicine could not be found.'],
                    ]);
                }

                if ($medicine->trashed() && ! $previousMedicineIds->contains($medicine->id)) {
                    throw ValidationException::withMessages([
                        'items' => ['Archived medicines cannot be added to a dispensing record.'],
                    ]);
                }

                $quantity = (int) $item['quantity_dispensed'];

                if ($medicine->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for {$medicine->medicine_brand}. "
                            . "Available: {$medicine->stock_quantity}.",
                        ],
                    ]);
                }

                $unitPrice  = (float) $medicine->unit_price;
                $totalPrice = round($unitPrice * $quantity, 2);

                $record->items()->create([
                    'medicine_id'        => $medicine->id,
                    'quantity_dispensed' => $quantity,
                    'unit_price'         => $unitPrice,
                    'total_price'        => $totalPrice,
                ]);

                $medicine->stock_quantity -= $quantity;
                $medicine->save();
            }

            return $record->load(['patient', 'doctor', 'items.medicine']);
        });
    }
}
