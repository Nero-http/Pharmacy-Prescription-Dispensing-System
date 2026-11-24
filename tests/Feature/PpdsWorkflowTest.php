<?php

namespace Tests\Feature;

use App\Models\DispenseRecord;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PpdsWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_and_medicine_pages_use_live_inventory_data(): void
    {
        $this->actingAs(User::factory()->create());

        Medicine::create([
            'medicine_sku' => 'MED-LOW',
            'medicine_brand' => 'Low stock medicine',
            'generic_name' => 'Generic medicine',
            'dosage_mg' => 250,
            'stock_quantity' => 8,
            'unit_price' => 5.25,
        ]);

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('stats.total_medicines', 1)
                ->where('stats.total_stock', 8)
                ->where('stats.low_stock_medicines', 1)
                ->where('stats.total_dispensing_records', 0)
                ->has('lowStockMedicines', 1)
            );

        $this->get('/medicines?search=MED-LOW')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('medicines/index')
                ->where('search', 'MED-LOW')
                ->where('medicines.data.0.medicine_sku', 'MED-LOW')
            );
    }

    public function test_medicine_can_be_created_and_edited_through_the_inertia_routes(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/medicines/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('medicines/form')
                ->where('medicine', null)
            );

        $this->post('/medicines', [
            'medicine_sku' => 'med-001',
            'medicine_brand' => 'Pain Relief',
            'generic_name' => 'Acetaminophen',
            'dosage_mg' => 500,
            'stock_quantity' => 25,
            'unit_price' => 12.50,
        ])->assertRedirect(route('medicines.index'));

        $medicine = Medicine::firstOrFail();
        $this->assertSame('MED-001', $medicine->medicine_sku);

        $this->get(route('medicines.edit', $medicine))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('medicines/form')
                ->where('medicine.id', $medicine->id)
                ->where('medicine.medicine_brand', 'Pain Relief')
            );

        $this->put(route('medicines.update', $medicine), [
            'medicine_sku' => 'MED-001',
            'medicine_brand' => 'Pain Relief Plus',
            'generic_name' => 'Acetaminophen',
            'dosage_mg' => 500,
            'stock_quantity' => 30,
            'unit_price' => 13.00,
        ])->assertRedirect(route('medicines.index'));

        $this->assertDatabaseHas('medicines', [
            'id' => $medicine->id,
            'medicine_brand' => 'Pain Relief Plus',
            'stock_quantity' => 30,
        ]);
    }

    public function test_medicine_price_must_be_between_zero_and_ten_thousand(): void
    {
        $this->actingAs(User::factory()->create());

        $medicineData = [
            'medicine_sku' => 'MED-PRICE',
            'medicine_brand' => 'Price validation medicine',
            'generic_name' => 'Generic medicine',
            'dosage_mg' => 100,
            'stock_quantity' => 10,
        ];

        foreach ([-0.01, 10000.01, 99999999999] as $price) {
            $this->from('/medicines/create')
                ->post('/medicines', [...$medicineData, 'unit_price' => $price])
                ->assertRedirect('/medicines/create')
                ->assertSessionHasErrors('unit_price');
        }

        $this->post('/medicines', [...$medicineData, 'unit_price' => 10000])
            ->assertRedirect(route('medicines.index'));

        $medicine = Medicine::firstOrFail();
        $this->assertSame(10000.0, (float) $medicine->unit_price);

        foreach ([-0.01, 10000.01, 99999999999] as $price) {
            $this->from(route('medicines.edit', $medicine))
                ->put(route('medicines.update', $medicine), [
                    ...$medicineData,
                    'unit_price' => $price,
                ])
                ->assertRedirect(route('medicines.edit', $medicine))
                ->assertSessionHasErrors('unit_price');
        }

        $this->put(route('medicines.update', $medicine), [
            ...$medicineData,
            'unit_price' => 0,
        ])->assertRedirect(route('medicines.index'));

        $this->assertSame(0.0, (float) $medicine->fresh()->unit_price);
    }

    public function test_medicine_stock_filters_counts_search_and_pagination_work_together(): void
    {
        $this->actingAs(User::factory()->create());
        config(['medicine.low_stock_threshold' => 10]);

        foreach ([11, 10, 1, 0, 20, 5, 0, 15, 12, 30, 40, 50] as $index => $stock) {
            Medicine::create([
                'medicine_sku' => sprintf('FILTER-%02d', $index + 1),
                'medicine_brand' => sprintf('Filter Medicine %02d', $index + 1),
                'generic_name' => 'Filter generic',
                'dosage_mg' => 100,
                'stock_quantity' => $stock,
                'unit_price' => 1.00,
            ]);
        }

        $this->get(route('medicines.index', ['search' => 'FILTER', 'stock_status' => 'all']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stockCounts.all', 12)
                ->where('stockCounts.in_stock', 7)
                ->where('stockCounts.low_stock', 3)
                ->where('stockCounts.out_of_stock', 2)
                ->where('lowStockThreshold', 10)
            );

        $this->get(route('medicines.index', ['search' => 'FILTER', 'stock_status' => 'low_stock']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stockStatus', 'low_stock')
                ->where('medicines.total', 3)
                ->where('medicines.data.0.stock_quantity', 10)
                ->where('medicines.data.1.stock_quantity', 1)
                ->where('medicines.data.2.stock_quantity', 5)
            );

        $this->get(route('medicines.index', [
            'search' => 'FILTER',
            'stock_status' => 'out_of_stock',
            'page' => 1,
        ]))->assertInertia(fn (Assert $page) => $page
            ->where('stockStatus', 'out_of_stock')
            ->where('medicines.total', 2)
        );

        $this->get(route('medicines.index', [
            'search' => 'FILTER',
            'stock_status' => 'in_stock',
            'page' => 2,
        ]))->assertInertia(fn (Assert $page) => $page
            ->where('medicines.current_page', 2)
            ->where('medicines.total', 7)
            ->where('medicines.data', fn ($data) => count($data) === 2)
            ->where('medicines.links.2.url', fn ($url) => str_contains($url, 'stock_status=in_stock'))
        );
    }

    public function test_soft_deleting_medicine_preserves_dispensing_history(): void
    {
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'Medicine History Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-MEDICINE-HISTORY',
            'doctor_name' => 'Medicine History Doctor',
        ]);
        $medicine = Medicine::create([
            'medicine_sku' => 'MED-HISTORY',
            'medicine_brand' => 'Historical Medicine',
            'generic_name' => 'Historical generic',
            'dosage_mg' => 100,
            'stock_quantity' => 4,
            'unit_price' => 2.50,
        ]);
        $today = now(config('app.timezone'))->toDateString();
        $dispenseData = [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => $today,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity_dispensed' => 1],
            ],
        ];

        $this->post(route('dispense-records.store'), $dispenseData)
            ->assertRedirect(route('dispense-records.index'));
        $record = DispenseRecord::firstOrFail();

        $this->delete(route('medicines.destroy', $medicine))
            ->assertRedirect(route('medicines.index'));

        $this->assertSoftDeleted('medicines', ['id' => $medicine->id]);
        $this->assertSame(3, Medicine::withTrashed()->findOrFail($medicine->id)->stock_quantity);

        $this->get(route('medicines.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('medicines.total', 0)
                ->where('stockCounts.all', 0)
            );

        $this->get(route('dispense-records.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.data.0.items.0.medicine.medicine_brand', 'Historical Medicine')
            );

        $this->get(route('dispense-records.edit', $record))
            ->assertInertia(fn (Assert $page) => $page
                ->where('medicines.0.deleted_at', fn ($deletedAt) => $deletedAt !== null)
            );

        $this->put(route('dispense-records.update', $record), $dispenseData)
            ->assertRedirect(route('dispense-records.index'));
        $this->assertSame(3, Medicine::withTrashed()->findOrFail($medicine->id)->stock_quantity);

        $this->from(route('dispense-records.create'))
            ->post(route('dispense-records.store'), $dispenseData)
            ->assertRedirect(route('dispense-records.create'))
            ->assertSessionHasErrors('items');
        $this->assertSame(1, DispenseRecord::count());
    }

    public function test_dispensing_creates_an_item_and_deducts_stock(): void
    {
        $this->actingAs(User::factory()->create());
        $today = now(config('app.timezone'))->toDateString();
        $patient = Patient::create(['patient_name' => 'Alex Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'dr-1001',
            'doctor_name' => 'Taylor Doctor',
        ]);
        $medicine = Medicine::create([
            'medicine_sku' => 'MED-002',
            'medicine_brand' => 'Daily Tablet',
            'generic_name' => 'Generic tablet',
            'dosage_mg' => 100,
            'stock_quantity' => 10,
            'unit_price' => 2.50,
        ]);

        $this->get('/dispense-records/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispense-records/form')
                ->has('patients', 1)
                ->has('doctors', 1)
                ->has('medicines', 1)
                ->where('minDispenseDate', $today)
            );

        $this->post('/dispense-records', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => $today,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity_dispensed' => 4],
            ],
        ])->assertRedirect(route('dispense-records.index'));

        $this->assertSame(6, $medicine->fresh()->stock_quantity);
        $record = DispenseRecord::with('items')->firstOrFail();
        $this->assertSame(10.0, (float) $record->items->first()->total_price);

        $this->get(route('dispense-records.edit', $record))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispense-records/form')
                ->where('record.id', $record->id)
                ->has('record.items', 1)
            );

        $this->put(route('dispense-records.update', $record), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => $today,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity_dispensed' => 5],
            ],
        ])->assertRedirect(route('dispense-records.index'));

        $record->refresh()->load('items');
        $this->assertSame(5, $medicine->fresh()->stock_quantity);
        $this->assertSame(5, $record->items->first()->quantity_dispensed);
    }

    public function test_dispensing_more_than_available_stock_fails_without_changing_stock(): void
    {
        $this->actingAs(User::factory()->create());
        $today = now(config('app.timezone'))->toDateString();
        $patient = Patient::create(['patient_name' => 'Sam Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-1002',
            'doctor_name' => 'Jordan Doctor',
        ]);
        $medicine = Medicine::create([
            'medicine_sku' => 'MED-003',
            'medicine_brand' => 'Limited Stock Tablet',
            'generic_name' => 'Generic tablet',
            'dosage_mg' => 100,
            'stock_quantity' => 3,
            'unit_price' => 1.25,
        ]);

        $this->from('/dispense-records/create')
            ->post('/dispense-records', [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'dispense_date' => $today,
                'items' => [
                    ['medicine_id' => $medicine->id, 'quantity_dispensed' => 4],
                ],
            ])
            ->assertRedirect('/dispense-records/create')
            ->assertSessionHasErrors('items');

        $this->assertSame(3, $medicine->fresh()->stock_quantity);
        $this->assertSame(0, DispenseRecord::count());
    }

    public function test_dispensing_date_is_limited_to_today_through_one_calendar_month(): void
    {
        $this->travelTo(Carbon::parse('2026-11-16 12:00:00', config('app.timezone')));
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'Range Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-RANGE',
            'doctor_name' => 'Range Doctor',
        ]);
        $medicine = Medicine::create([
            'medicine_sku' => 'MED-RANGE',
            'medicine_brand' => 'Range Medicine',
            'generic_name' => 'Generic medicine',
            'dosage_mg' => 100,
            'stock_quantity' => 10,
            'unit_price' => 1.00,
        ]);
        $validData = [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity_dispensed' => 1],
            ],
        ];

        $this->get(route('dispense-records.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('minDispenseDate', '2026-11-16')
                ->where('maxDispenseDate', '2026-12-16')
            );

        $this->post(route('dispense-records.store'), [
            ...$validData,
            'dispense_date' => '2026-11-16',
        ])->assertRedirect(route('dispense-records.index'));

        $record = DispenseRecord::firstOrFail();

        $this->post(route('dispense-records.store'), [
            ...$validData,
            'dispense_date' => '2026-12-16',
        ])->assertRedirect(route('dispense-records.index'));

        foreach (['2026-11-15', '2026-12-17'] as $date) {
            $this->from(route('dispense-records.create'))
                ->post(route('dispense-records.store'), [
                    ...$validData,
                    'dispense_date' => $date,
                ])
                ->assertRedirect(route('dispense-records.create'))
                ->assertSessionHasErrors('dispense_date');
        }

        $this->put(route('dispense-records.update', $record), [
            ...$validData,
            'dispense_date' => '2026-12-16',
        ])->assertRedirect(route('dispense-records.index'));

        foreach (['2026-11-15', '2026-12-17'] as $date) {
            $this->from(route('dispense-records.edit', $record))
                ->put(route('dispense-records.update', $record), [
                    ...$validData,
                    'dispense_date' => $date,
                ])
                ->assertRedirect(route('dispense-records.edit', $record))
                ->assertSessionHasErrors('dispense_date');
        }

        $this->assertSame('2026-12-16', $record->fresh()->dispense_date->toDateString());
        $this->assertSame(2, DispenseRecord::count());

        $this->travelTo(Carbon::parse('2026-11-17 12:00:00', config('app.timezone')));
        $this->get(route('dispense-records.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('minDispenseDate', '2026-11-17')
                ->where('maxDispenseDate', '2026-12-17')
            );
    }

    public function test_patients_and_doctors_can_be_created_and_updated_for_dispensing(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/patients', [
            'patient_name' => 'New Patient',
        ])->assertCreated()->assertJsonPath('patient.patient_name', 'New Patient');

        $patient = Patient::firstOrFail();
        $this->putJson("/patients/{$patient->id}", [
            'patient_name' => 'Updated Patient',
        ])->assertOk()->assertJsonPath('patient.patient_name', 'Updated Patient');

        $this->assertSame(1, Patient::count());
        $this->assertSame('Updated Patient', $patient->refresh()->patient_name);

        $this->postJson('/doctors', [
            'doctor_name' => 'Dr. New Doctor',
            'doctor_license_no' => 'lic-1001',
        ])->assertCreated()->assertJsonPath('doctor.doctor_license_no', 'LIC-1001');

        $doctor = Doctor::firstOrFail();
        $this->putJson("/doctors/{$doctor->id}", [
            'doctor_name' => 'Dr. Updated Doctor',
            'doctor_license_no' => 'lic-1002',
        ])->assertOk()->assertJsonPath('doctor.doctor_license_no', 'LIC-1002');

        $this->assertSame(1, Doctor::count());
        $this->assertSame('Dr. Updated Doctor', $doctor->refresh()->doctor_name);

        $this->postJson('/doctors', [
            'doctor_name' => 'Duplicate License Doctor',
            'doctor_license_no' => 'lic-1002',
        ])->assertUnprocessable()->assertJsonValidationErrors('doctor_license_no');
    }

    public function test_authenticated_users_can_soft_delete_a_patient_without_affecting_dispensing_history(): void
    {
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'Archived Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-ARCHIVE-PATIENT',
            'doctor_name' => 'History Doctor',
        ]);
        $record = DispenseRecord::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => now()->toDateString(),
        ]);

        $this->deleteJson(route('patients.destroy', $patient))
            ->assertOk()
            ->assertJsonPath('message', 'Patient deleted successfully.');

        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
        $this->assertSame(0, Patient::count());
        $this->assertDatabaseHas('dispense_records', ['id' => $record->id, 'patient_id' => $patient->id]);
        $this->assertSame('Archived Patient', $record->fresh()->patient->patient_name);

        $this->get(route('dispense-records.create'))
            ->assertInertia(fn (Assert $page) => $page->has('patients', 0));
        $this->get(route('dispense-records.edit', $record))
            ->assertInertia(fn (Assert $page) => $page
                ->has('patients', 0)
            );
    }

    public function test_authenticated_users_can_soft_delete_a_doctor_without_affecting_dispensing_history(): void
    {
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'History Patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-ARCHIVE-DOCTOR',
            'doctor_name' => 'Archived Doctor',
        ]);
        $record = DispenseRecord::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => now()->toDateString(),
        ]);

        $this->deleteJson(route('doctors.destroy', $doctor))
            ->assertOk()
            ->assertJsonPath('message', 'Doctor deleted successfully.');

        $this->assertSoftDeleted('doctors', ['id' => $doctor->id]);
        $this->assertSame(0, Doctor::count());
        $this->assertDatabaseHas('dispense_records', ['id' => $record->id, 'doctor_id' => $doctor->id]);
        $this->assertSame('Archived Doctor', $record->fresh()->doctor->doctor_name);

        $this->get(route('dispense-records.create'))
            ->assertInertia(fn (Assert $page) => $page->has('doctors', 0));
        $this->get(route('dispense-records.edit', $record))
            ->assertInertia(fn (Assert $page) => $page
                ->has('doctors', 0)
            );
    }

    public function test_archived_patients_and_doctors_cannot_be_selected_for_dispensing(): void
    {
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'Archived patient']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-ARCHIVED',
            'doctor_name' => 'Archived doctor',
        ]);
        $medicine = Medicine::create([
            'medicine_sku' => 'MED-ARCHIVED',
            'medicine_brand' => 'Archived validation medicine',
            'generic_name' => 'Generic medicine',
            'dosage_mg' => 100,
            'stock_quantity' => 5,
            'unit_price' => 1.00,
        ]);
        $record = DispenseRecord::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => now()->toDateString(),
        ]);
        $patient->delete();
        $doctor->delete();

        $this->get(route('dispense-records.edit', $record))
            ->assertInertia(fn (Assert $page) => $page
                ->has('patients', 0)
                ->has('doctors', 0)
            );

        $data = [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => now()->toDateString(),
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity_dispensed' => 1],
            ],
        ];

        $this->from(route('dispense-records.create'))
            ->post(route('dispense-records.store'), $data)
            ->assertSessionHasErrors(['patient_id', 'doctor_id']);

        $this->from(route('dispense-records.edit', $record))
            ->put(route('dispense-records.update', $record), $data)
            ->assertSessionHasErrors(['patient_id', 'doctor_id']);
    }

    public function test_non_admin_users_can_delete_patients_and_doctors(): void
    {
        $this->actingAs(User::factory()->create());
        $patient = Patient::create(['patient_name' => 'Patient to Delete']);
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-NON-ADMIN',
            'doctor_name' => 'Non-admin Doctor',
        ]);

        $this->deleteJson(route('patients.destroy', $patient))
            ->assertOk()
            ->assertJsonPath('message', 'Patient deleted successfully.');
        $this->deleteJson(route('doctors.destroy', $doctor))
            ->assertOk()
            ->assertJsonPath('message', 'Doctor deleted successfully.');

        $this->deleteJson('/patients/999999')->assertNotFound();
        $this->deleteJson('/doctors/999999')->assertNotFound();
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
        $this->assertSoftDeleted('doctors', ['id' => $doctor->id]);
    }

    public function test_guests_cannot_delete_patients(): void
    {
        $patient = Patient::create(['patient_name' => 'Guest Protected Patient']);

        $this->deleteJson(route('patients.destroy', $patient))->assertUnauthorized();

        $this->assertDatabaseHas('patients', ['id' => $patient->id, 'deleted_at' => null]);
    }

    public function test_guests_cannot_delete_doctors(): void
    {
        $doctor = Doctor::create([
            'doctor_license_no' => 'DR-GUEST-PROTECTED',
            'doctor_name' => 'Guest Protected Doctor',
        ]);

        $this->deleteJson(route('doctors.destroy', $doctor))->assertUnauthorized();

        $this->assertDatabaseHas('doctors', ['id' => $doctor->id, 'deleted_at' => null]);
    }
}
