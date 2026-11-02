<?php

namespace Tests\Feature;

use App\Models\DispenseRecord;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_dispensing_creates_an_item_and_deducts_stock(): void
    {
        $this->actingAs(User::factory()->create());
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
            );

        $this->post('/dispense-records', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'dispense_date' => '2026-11-02',
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
            'dispense_date' => '2026-11-02',
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
                'dispense_date' => '2026-11-02',
                'items' => [
                    ['medicine_id' => $medicine->id, 'quantity_dispensed' => 4],
                ],
            ])
            ->assertRedirect('/dispense-records/create')
            ->assertSessionHasErrors('items');

        $this->assertSame(3, $medicine->fresh()->stock_quantity);
        $this->assertSame(0, DispenseRecord::count());
    }
}
