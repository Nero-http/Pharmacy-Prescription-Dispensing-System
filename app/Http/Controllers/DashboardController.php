<?php

namespace App\Http\Controllers;

use App\Models\DispenseRecord;
use App\Models\Medicine;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 10;

    public function __invoke(): Response
    {
        $recentRecords = DispenseRecord::query()
            ->with(['patient', 'doctor', 'items.medicine'])
            ->latest('dispense_date')
            ->latest('id')
            ->take(6)
            ->get()
            ->map(fn (DispenseRecord $record) => [
                'id' => $record->id,
                'dispense_date' => $record->dispense_date->toDateString(),
                'patient_name' => $record->patient->patient_name,
                'doctor_name' => $record->doctor->doctor_name,
                'items' => $record->items->map(fn ($item) => [
                    'medicine_name' => $item->medicine->medicine_brand,
                    'quantity' => $item->quantity_dispensed,
                ]),
                'total' => (float) $record->items->sum('total_price'),
            ]);

        $lowStockMedicines = Medicine::query()
            ->where('stock_quantity', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('stock_quantity')
            ->orderBy('medicine_brand')
            ->take(6)
            ->get([
                'id',
                'medicine_sku',
                'medicine_brand',
                'generic_name',
                'stock_quantity',
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_medicines' => Medicine::count(),
                'total_stock' => (int) Medicine::sum('stock_quantity'),
                'low_stock_medicines' => Medicine::where(
                    'stock_quantity',
                    '<=',
                    self::LOW_STOCK_THRESHOLD
                )->count(),
                'total_dispensing_records' => DispenseRecord::count(),
            ],
            'recentRecords' => $recentRecords,
            'lowStockMedicines' => $lowStockMedicines,
        ]);
    }
}
