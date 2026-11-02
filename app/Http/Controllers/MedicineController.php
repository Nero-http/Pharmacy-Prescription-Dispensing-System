<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Services\DomainService;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $medicines = Medicine::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('medicine_sku', 'like', "%{$search}%")
                        ->orWhere('medicine_brand', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('medicine_brand')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('medicines/index', [
            'medicines' => $medicines,
            'search' => $search,
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
}
