<?php

namespace App\Services;

use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\DispenseRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DomainService
{
    /**
     * Sanitize string inputs.
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

    /**
     * Create a new medicine.
     */
    public function createMedicine(array $data): Medicine
    {
        $data = $this->sanitize($data);

        $data['medicine_sku'] = strtoupper($data['medicine_sku']);

        return Medicine::create($data);
    }

    /**
     * Update an existing medicine.
     */
    public function updateMedicine(
        Medicine $medicine,
        array $data
    ): Medicine {
        $data = $this->sanitize($data);

        $data['medicine_sku'] = strtoupper($data['medicine_sku']);

        return DB::transaction(function () use ($medicine, $data) {
            $lockedMedicine = Medicine::query()
                ->lockForUpdate()
                ->findOrFail($medicine->id);

            $lockedMedicine->update($data);

            return $lockedMedicine->refresh();
        });
    }

    /**
     * Create a dispensing record and deduct medicine stock.
     */
    public function createDispenseRecord(array $data): DispenseRecord
    {
        $data = $this->sanitize($data);

        return DB::transaction(function () use ($data) {
            $doctor = Doctor::query()
                ->lockForUpdate()
                ->findOrFail($data['doctor_id']);

            $doctor->doctor_license_no = strtoupper(
                trim($doctor->doctor_license_no)
            );

            $doctor->save();

            $record = DispenseRecord::create([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $doctor->id,
                'dispense_date' => $data['dispense_date'],
            ]);

            $items = collect($data['items'])
                ->sortBy('medicine_id')
                ->values();

            foreach ($items as $item) {
                $medicine = Medicine::query()
                    ->lockForUpdate()
                    ->findOrFail($item['medicine_id']);

                $quantity = (int) $item['quantity_dispensed'];

                if ($medicine->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for {$medicine->medicine_brand}. "
                            . "Available: {$medicine->stock_quantity}.",
                        ],
                    ]);
                }

                $unitPrice = (float) $medicine->unit_price;
                $totalPrice = round($unitPrice * $quantity, 2);

                $record->items()->create([
                    'medicine_id' => $medicine->id,
                    'quantity_dispensed' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                $medicine->decrement(
                    'stock_quantity',
                    $quantity
                );
            }

            return $record->load([
                'patient',
                'doctor',
                'items.medicine',
            ]);
        });
    }

    /**
     * Update a dispensing record and recalculate stock.
     */
    public function updateDispenseRecord(
        int $id,
        array $data
    ): DispenseRecord {
        $data = $this->sanitize($data);

        return DB::transaction(function () use ($id, $data) {
            $record = DispenseRecord::query()
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($id);

            $doctor = Doctor::query()
                ->lockForUpdate()
                ->findOrFail($data['doctor_id']);

            $doctor->doctor_license_no = strtoupper(
                trim($doctor->doctor_license_no)
            );

            $doctor->save();

            // Lock all affected medicine rows in a consistent order.
            $medicineIds = collect($data['items'])
                ->pluck('medicine_id')
                ->merge($record->items->pluck('medicine_id'))
                ->unique()
                ->sort()
                ->values();

            $medicines = Medicine::query()
                ->whereIn('id', $medicineIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Restore stock from the previous dispensing record.
            foreach ($record->items as $oldItem) {
                $medicine = $medicines->get(
                    $oldItem->medicine_id
                );

                if (!$medicine) {
                    throw ValidationException::withMessages([
                        'items' => [
                            'A previously dispensed medicine no longer exists.',
                        ],
                    ]);
                }

                $medicine->stock_quantity +=
                    $oldItem->quantity_dispensed;

                $medicine->save();
            }

            $record->update([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $doctor->id,
                'dispense_date' => $data['dispense_date'],
            ]);

            // Replace the previous items with the new items.
            $record->items()->delete();

            $items = collect($data['items'])
                ->sortBy('medicine_id')
                ->values();

            foreach ($items as $item) {
                $medicine = $medicines->get(
                    $item['medicine_id']
                );

                if (!$medicine) {
                    throw ValidationException::withMessages([
                        'items' => [
                            'The selected medicine could not be found.',
                        ],
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

                $unitPrice = (float) $medicine->unit_price;
                $totalPrice = round($unitPrice * $quantity, 2);

                $record->items()->create([
                    'medicine_id' => $medicine->id,
                    'quantity_dispensed' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                $medicine->stock_quantity -= $quantity;
                $medicine->save();
            }

            return $record->load([
                'patient',
                'doctor',
                'items.medicine',
            ]);
        });
    }
}
