<?php

namespace Database\Seeders;

use App\Models\DispenseRecord;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Services\DomainService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DemoPharmacySeeder extends Seeder
{
    public function run(): void
    {
        $added = [
            'medicines' => 0,
            'patients' => 0,
            'doctors' => 0,
            'dispense_records' => 0,
            'dispense_items' => 0,
        ];

        DB::transaction(function () use (&$added): void {
            $medicines = [];

            foreach ($this->medicineData() as $data) {
                $medicine = Medicine::firstOrCreate(
                    ['medicine_sku' => $data['medicine_sku']],
                    $data
                );

                if ($medicine->wasRecentlyCreated) {
                    $added['medicines']++;
                }

                $medicines[$medicine->medicine_sku] = $medicine;
            }

            $patients = [];

            foreach ($this->patientNames() as $index => $name) {
                $patient = Patient::query()
                    ->where('patient_name', "{$name} [PPDS Demo]")
                    ->first();

                if ($patient) {
                    $patient->update(['patient_name' => $name]);
                } else {
                    $patient = Patient::firstOrCreate([
                        'patient_name' => $name,
                    ]);
                }

                if ($patient->wasRecentlyCreated) {
                    $added['patients']++;
                }

                $patients[$index] = $patient;
            }

            $doctors = [];

            foreach ($this->doctorData() as $index => $data) {
                $doctor = Doctor::firstOrCreate(
                    ['doctor_license_no' => $data['doctor_license_no']],
                    $data
                );

                if ($doctor->doctor_name !== $data['doctor_name']) {
                    $doctor->update(['doctor_name' => $data['doctor_name']]);
                }

                if ($doctor->wasRecentlyCreated) {
                    $added['doctors']++;
                }

                $doctors[$index] = $doctor;
            }

            $service = app(DomainService::class);

            foreach ($this->dispensingData() as $index => $data) {
                $patient = $patients[$index];
                $doctor = $doctors[$data['doctor']];
                $date = $data['date'];
                $existingRecord = DispenseRecord::query()
                    ->where('patient_id', $patient->id)
                    ->whereDate('dispense_date', $date)
                    ->first();

                $expectedItems = collect($data['items'])
                    ->mapWithKeys(fn (array $item) => [
                        $medicines[$item['sku']]->id => $item['quantity'],
                    ])
                    ->sortKeys()
                    ->all();

                if ($existingRecord) {
                    $existingItems = $existingRecord->items()
                        ->get(['medicine_id', 'quantity_dispensed'])
                        ->mapWithKeys(fn ($item) => [
                            $item->medicine_id => $item->quantity_dispensed,
                        ])
                        ->sortKeys()
                        ->all();

                    if ($existingRecord->doctor_id !== $doctor->id || $existingItems !== $expectedItems) {
                        throw new RuntimeException(
                            "Existing demo dispensing record for {$patient->patient_name} does not match the sample data."
                        );
                    }

                    continue;
                }

                $record = $service->createDispenseRecord([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'dispense_date' => $date,
                    'items' => collect($data['items'])
                        ->map(fn (array $item) => [
                            'medicine_id' => $medicines[$item['sku']]->id,
                            'quantity_dispensed' => $item['quantity'],
                        ])
                        ->all(),
                ]);

                $added['dispense_records']++;
                $added['dispense_items'] += $record->items->count();
            }
        });

        if ($this->command) {
            $this->command->info('PPDS demo records added:');

            foreach ($added as $table => $count) {
                $this->command->line("  {$table}: {$count}");
            }
        }
    }

    /**
     * @return list<array{medicine_sku: string, medicine_brand: string, generic_name: string, dosage_mg: int, stock_quantity: int, unit_price: string}>
     */
    private function medicineData(): array
    {
        return [
            ['medicine_sku' => 'PPDS-DEMO-PAR-500', 'medicine_brand' => 'Paracetamol 500 mg', 'generic_name' => 'Paracetamol', 'dosage_mg' => 500, 'stock_quantity' => 130, 'unit_price' => '2.50'],
            ['medicine_sku' => 'PPDS-DEMO-AMX-500', 'medicine_brand' => 'Amoxicillin 500 mg', 'generic_name' => 'Amoxicillin', 'dosage_mg' => 500, 'stock_quantity' => 80, 'unit_price' => '8.00'],
            ['medicine_sku' => 'PPDS-DEMO-CET-10', 'medicine_brand' => 'Cetirizine 10 mg', 'generic_name' => 'Cetirizine', 'dosage_mg' => 10, 'stock_quantity' => 60, 'unit_price' => '3.50'],
            ['medicine_sku' => 'PPDS-DEMO-IBU-400', 'medicine_brand' => 'Ibuprofen 400 mg', 'generic_name' => 'Ibuprofen', 'dosage_mg' => 400, 'stock_quantity' => 70, 'unit_price' => '4.00'],
            ['medicine_sku' => 'PPDS-DEMO-OME-20', 'medicine_brand' => 'Omeprazole 20 mg', 'generic_name' => 'Omeprazole', 'dosage_mg' => 20, 'stock_quantity' => 50, 'unit_price' => '5.50'],
            ['medicine_sku' => 'PPDS-DEMO-MET-500', 'medicine_brand' => 'Metformin 500 mg', 'generic_name' => 'Metformin', 'dosage_mg' => 500, 'stock_quantity' => 90, 'unit_price' => '3.00'],
            ['medicine_sku' => 'PPDS-DEMO-LOS-50', 'medicine_brand' => 'Losartan 50 mg', 'generic_name' => 'Losartan', 'dosage_mg' => 50, 'stock_quantity' => 60, 'unit_price' => '4.50'],
            ['medicine_sku' => 'PPDS-DEMO-VITC-500', 'medicine_brand' => 'Vitamin C 500 mg', 'generic_name' => 'Ascorbic acid', 'dosage_mg' => 500, 'stock_quantity' => 90, 'unit_price' => '2.00'],
            ['medicine_sku' => 'PPDS-DEMO-LOP-2', 'medicine_brand' => 'Loperamide 2 mg', 'generic_name' => 'Loperamide', 'dosage_mg' => 2, 'stock_quantity' => 40, 'unit_price' => '3.00'],
            ['medicine_sku' => 'PPDS-DEMO-MEF-500', 'medicine_brand' => 'Mefenamic acid 500 mg', 'generic_name' => 'Mefenamic acid', 'dosage_mg' => 500, 'stock_quantity' => 50, 'unit_price' => '4.50'],
            ['medicine_sku' => 'PPDS-DEMO-AZI-500', 'medicine_brand' => 'Azithromycin 500 mg', 'generic_name' => 'Azithromycin', 'dosage_mg' => 500, 'stock_quantity' => 35, 'unit_price' => '15.00'],
            ['medicine_sku' => 'PPDS-DEMO-ORS-20', 'medicine_brand' => 'Oral rehydration salts', 'generic_name' => 'Oral rehydration salts', 'dosage_mg' => 20, 'stock_quantity' => 50, 'unit_price' => '6.00'],
            ['medicine_sku' => 'PPDS-DEMO-ATOR-20', 'medicine_brand' => 'Atorvastatin 20 mg', 'generic_name' => 'Atorvastatin', 'dosage_mg' => 20, 'stock_quantity' => 50, 'unit_price' => '7.50'],
            ['medicine_sku' => 'PPDS-DEMO-SAL-100', 'medicine_brand' => 'Salbutamol 100 mcg', 'generic_name' => 'Salbutamol', 'dosage_mg' => 1, 'stock_quantity' => 35, 'unit_price' => '12.00'],
            ['medicine_sku' => 'PPDS-DEMO-DIC-50', 'medicine_brand' => 'Diclofenac 50 mg', 'generic_name' => 'Diclofenac', 'dosage_mg' => 50, 'stock_quantity' => 4, 'unit_price' => '4.00'],
            ['medicine_sku' => 'PPDS-DEMO-ALB-2', 'medicine_brand' => 'Albendazole 200 mg', 'generic_name' => 'Albendazole', 'dosage_mg' => 200, 'stock_quantity' => 7, 'unit_price' => '8.00'],
        ];
    }

    /**
     * @return list<string>
     */
    private function patientNames(): array
    {
        return [
            'Avery Bennett',
            'Jordan Cruz',
            'Camille Reyes',
            'Nathan Cole',
            'Sofia Martinez',
            'Elias Wong',
            'Maya Santos',
            'Oliver Grant',
            'Leila Haddad',
            'Caleb Moore',
            'Zoe Castillo',
            'Daniel Kim',
            'Isabel Flores',
            'Marcus Hill',
            'Priya Shah',
        ];
    }

    /**
     * @return list<array{doctor_license_no: string, doctor_name: string}>
     */
    private function doctorData(): array
    {
        return [
            ['doctor_license_no' => 'PPDS-DEMO-MD-001', 'doctor_name' => 'Dr. Elena Navarro'],
            ['doctor_license_no' => 'PPDS-DEMO-MD-002', 'doctor_name' => 'Dr. Samuel Ortiz'],
            ['doctor_license_no' => 'PPDS-DEMO-MD-003', 'doctor_name' => 'Dr. Priya Raman'],
            ['doctor_license_no' => 'PPDS-DEMO-MD-004', 'doctor_name' => 'Dr. Michael Tan'],
            ['doctor_license_no' => 'PPDS-DEMO-MD-005', 'doctor_name' => 'Dr. Grace Villanueva'],
        ];
    }

    /**
     * @return list<array{date: string, doctor: int, items: list<array{sku: string, quantity: int}>}>
     */
    private function dispensingData(): array
    {
        return [
            ['date' => '2026-10-05', 'doctor' => 0, 'items' => [['sku' => 'PPDS-DEMO-PAR-500', 'quantity' => 8], ['sku' => 'PPDS-DEMO-CET-10', 'quantity' => 2]]],
            ['date' => '2026-10-06', 'doctor' => 1, 'items' => [['sku' => 'PPDS-DEMO-AMX-500', 'quantity' => 10], ['sku' => 'PPDS-DEMO-PAR-500', 'quantity' => 6]]],
            ['date' => '2026-10-08', 'doctor' => 2, 'items' => [['sku' => 'PPDS-DEMO-IBU-400', 'quantity' => 8], ['sku' => 'PPDS-DEMO-OME-20', 'quantity' => 2]]],
            ['date' => '2026-10-09', 'doctor' => 3, 'items' => [['sku' => 'PPDS-DEMO-MET-500', 'quantity' => 12], ['sku' => 'PPDS-DEMO-LOS-50', 'quantity' => 7]]],
            ['date' => '2026-10-11', 'doctor' => 4, 'items' => [['sku' => 'PPDS-DEMO-VITC-500', 'quantity' => 10], ['sku' => 'PPDS-DEMO-CET-10', 'quantity' => 3]]],
            ['date' => '2026-10-12', 'doctor' => 0, 'items' => [['sku' => 'PPDS-DEMO-MEF-500', 'quantity' => 8], ['sku' => 'PPDS-DEMO-PAR-500', 'quantity' => 10]]],
            ['date' => '2026-10-14', 'doctor' => 1, 'items' => [['sku' => 'PPDS-DEMO-AMX-500', 'quantity' => 8], ['sku' => 'PPDS-DEMO-LOP-2', 'quantity' => 2]]],
            ['date' => '2026-10-15', 'doctor' => 2, 'items' => [['sku' => 'PPDS-DEMO-MET-500', 'quantity' => 10], ['sku' => 'PPDS-DEMO-ATOR-20', 'quantity' => 3]]],
            ['date' => '2026-10-17', 'doctor' => 3, 'items' => [['sku' => 'PPDS-DEMO-PAR-500', 'quantity' => 12], ['sku' => 'PPDS-DEMO-IBU-400', 'quantity' => 6]]],
            ['date' => '2026-10-18', 'doctor' => 4, 'items' => [['sku' => 'PPDS-DEMO-AZI-500', 'quantity' => 5], ['sku' => 'PPDS-DEMO-VITC-500', 'quantity' => 8]]],
            ['date' => '2026-10-20', 'doctor' => 0, 'items' => [['sku' => 'PPDS-DEMO-LOS-50', 'quantity' => 6], ['sku' => 'PPDS-DEMO-OME-20', 'quantity' => 4]]],
            ['date' => '2026-10-21', 'doctor' => 1, 'items' => [['sku' => 'PPDS-DEMO-ORS-20', 'quantity' => 4], ['sku' => 'PPDS-DEMO-PAR-500', 'quantity' => 8]]],
            ['date' => '2026-10-23', 'doctor' => 2, 'items' => [['sku' => 'PPDS-DEMO-ATOR-20', 'quantity' => 6], ['sku' => 'PPDS-DEMO-MEF-500', 'quantity' => 4]]],
            ['date' => '2026-10-24', 'doctor' => 3, 'items' => [['sku' => 'PPDS-DEMO-CET-10', 'quantity' => 8], ['sku' => 'PPDS-DEMO-LOP-2', 'quantity' => 3]]],
            ['date' => '2026-10-26', 'doctor' => 4, 'items' => [['sku' => 'PPDS-DEMO-AMX-500', 'quantity' => 9], ['sku' => 'PPDS-DEMO-IBU-400', 'quantity' => 7]]],
        ];
    }
}
