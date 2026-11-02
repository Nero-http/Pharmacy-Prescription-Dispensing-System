<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\DispenseItem;
use App\Models\DispenseRecord;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoPharmacySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_is_repeatable_and_preserves_existing_rows_and_users(): void
    {
        $user = User::factory()->create();
        $existingMedicine = Medicine::create([
            'medicine_sku' => 'EXISTING-PPDS-MED',
            'medicine_brand' => 'Existing medicine',
            'generic_name' => 'Existing generic',
            'dosage_mg' => 100,
            'stock_quantity' => 17,
            'unit_price' => '9.25',
        ]);

        $this->seed(DatabaseSeeder::class);
        $stockAfterFirstRun = Medicine::query()
            ->where('medicine_sku', 'like', 'PPDS-DEMO-%')
            ->orderBy('medicine_sku')
            ->pluck('stock_quantity', 'medicine_sku')
            ->all();

        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
        $this->assertDatabaseHas('medicines', [
            'id' => $existingMedicine->id,
            'medicine_brand' => 'Existing medicine',
            'stock_quantity' => 17,
        ]);
        $this->assertDatabaseCount('medicines', 17);
        $this->assertDatabaseCount('patients', 20);
        $this->assertSame(
            0,
            \App\Models\Patient::query()
                ->where('patient_name', 'like', '%[PPDS Demo]%')
                ->count()
        );
        $this->assertDatabaseCount('doctors', 5);
        $this->assertDatabaseCount('dispense_records', 20);
        $this->assertDatabaseCount('dispense_items', 40);
        $this->assertDatabaseHas('medicines', [
            'medicine_sku' => 'PPDS-DEMO-PAR-500',
            'stock_quantity' => 77,
        ]);
        $this->assertDatabaseHas('medicines', [
            'medicine_sku' => 'PPDS-DEMO-DIC-50',
            'stock_quantity' => 4,
        ]);
        $this->assertSame(
            0,
            DispenseRecord::query()
                ->whereDoesntHave('patient')
                ->orWhereDoesntHave('doctor')
                ->count()
        );
        $this->assertSame(
            0,
            DispenseItem::query()
                ->whereDoesntHave('medicine')
                ->orWhereDoesntHave('dispenseRecord')
                ->count()
        );
        $this->assertSame(
            $stockAfterFirstRun,
            Medicine::query()
                ->where('medicine_sku', 'like', 'PPDS-DEMO-%')
                ->orderBy('medicine_sku')
                ->pluck('stock_quantity', 'medicine_sku')
                ->all()
        );
        $this->assertSame(
            0,
            Medicine::query()
                ->where('medicine_sku', 'like', 'PPDS-DEMO-%')
                ->where('stock_quantity', '<', 0)
                ->count()
        );
    }
}
