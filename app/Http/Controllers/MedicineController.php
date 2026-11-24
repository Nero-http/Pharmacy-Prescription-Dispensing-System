<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Services\DomainService;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MedicineController extends Controller
{
    public function __construct(
        private DomainService $service
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $stockStatus = $request->validate([
            'stock_status' => ['sometimes', Rule::in(['all', 'in_stock', 'low_stock', 'out_of_stock'])],
        ])['stock_status'] ?? 'all';
        $lowStockThreshold = (int) config('medicine.low_stock_threshold', 10);

        $query = Medicine::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('medicine_sku', 'like', "%{$search}%")
                        ->orWhere('medicine_brand', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%");
                });
            });

        $stockCounts = [
            'all' => (clone $query)->count(),
            'in_stock' => (clone $query)->where('stock_quantity', '>', $lowStockThreshold)->count(),
            'low_stock' => (clone $query)->whereBetween('stock_quantity', [1, $lowStockThreshold])->count(),
            'out_of_stock' => (clone $query)->where('stock_quantity', 0)->count(),
        ];

        $medicines = (clone $query)
            ->when($stockStatus === 'in_stock', fn ($query) => $query->where('stock_quantity', '>', $lowStockThreshold))
            ->when($stockStatus === 'low_stock', fn ($query) => $query->whereBetween('stock_quantity', [1, $lowStockThreshold]))
            ->when($stockStatus === 'out_of_stock', fn ($query) => $query->where('stock_quantity', 0))
            ->orderBy('medicine_brand')
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('medicines/index', [
            'medicines' => $medicines,
            'search' => $search,
            'stockStatus' => $stockStatus,
            'stockCounts' => $stockCounts,
            'lowStockThreshold' => $lowStockThreshold,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('medicines/form', [
            'medicine' => null,
        ]);
    }

    public function edit(Medicine $medicine): Response
    {
        return Inertia::render('medicines/form', [
            'medicine' => $medicine,
        ]);
    }

    public function store(
        StoreMedicineRequest $request
    ): RedirectResponse {
        $this->service->createMedicine($request->validated());

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Medicine created successfully.');
    }

    public function update(
        UpdateMedicineRequest $request,
        Medicine $medicine
    ): RedirectResponse {
        $this->service->updateMedicine(
            $medicine,
            $request->validated()
        );

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Medicine updated successfully.');
    }

    public function destroy(Medicine $medicine): RedirectResponse
    {
        $medicine->delete();

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Medicine deleted successfully.');
    }
}
