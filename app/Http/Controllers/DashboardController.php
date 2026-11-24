<?php

namespace App\Http\Controllers;

use App\Models\DispenseRecord;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $lowStockThreshold = (int) config('medicine.low_stock_threshold', 10);

        $recentRecords = DispenseRecord::query()
    ->select([
        'id',
        'patient_id',
        'doctor_id',
        'dispense_date',
    ])
    ->with([
        'patient:id,patient_name',
        'doctor:id,doctor_name',
        'items:id,dispense_record_id,medicine_id,quantity_dispensed,total_price',
        'items.medicine:id,medicine_brand',
    ])
    ->withSum('items', 'total_price')
    ->latest('dispense_date')
    ->latest('id')
    ->take(6)
    ->get()
    ->map(fn (DispenseRecord $record) => [
        'id' => $record->id,

        'dispense_date' => $record->dispense_date?->toDateString(),

        'patient_name' => $record->patient?->patient_name
            ?? 'Unknown Patient',

        'doctor_name' => $record->doctor?->doctor_name
            ?? 'Unknown Doctor',

        'items' => $record->items->map(fn ($item) => [
            'medicine_name' => $item->medicine?->medicine_brand
                ?? 'Unknown Medicine',

            'quantity' => $item->quantity_dispensed,
        ]),

        'total' => (float) ($record->items_sum_total_price ?? 0),
    ]);

        $lowStockMedicines = Medicine::query()
            ->where('stock_quantity', '<=', $lowStockThreshold)
            ->orderBy('stock_quantity')
            ->orderBy('medicine_brand')
            ->take(6)
            ->get(['id', 'medicine_sku', 'medicine_brand', 'generic_name', 'stock_quantity']);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_medicines'          => Medicine::count(),
                'total_stock'              => (int) Medicine::sum('stock_quantity'),
                'low_stock_medicines'      => Medicine::where('stock_quantity', '<=', $lowStockThreshold)->count(),
                'total_dispensing_records' => DispenseRecord::count(),
                'total_patients'           => Patient::count(),
                'total_doctors'            => Doctor::count(),
            ],
            'recentRecords'     => $recentRecords,
            'lowStockMedicines' => $lowStockMedicines,
        ]);
    }
}
