<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDispenseRecordRequest;
use App\Http\Requests\UpdateDispenseRecordRequest;
use App\Models\DispenseRecord;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Services\DomainService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DispenseRecordController extends Controller
{
    public function __construct(private DomainService $service) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $records = DispenseRecord::with(['patient', 'doctor', 'items.medicine'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    // Patient name
                    $q->whereHas(
                        'patient',
                        fn ($p) => $p->where('patient_name', 'like', '%' . $search . '%'),
                    )
                    // Doctor name or licence number
                    ->orWhereHas(
                        'doctor',
                        fn ($d) => $d->where('doctor_name', 'like', '%' . $search . '%')
                                    ->orWhere('doctor_license_no', 'like', '%' . $search . '%'),
                    )
                    // Medicine brand or generic name — nested through items
                    ->orWhereHas('items', function ($i) use ($search) {
                        $i->whereHas('medicine', fn ($m) => $m
                            ->where('medicine_brand', 'like', '%' . $search . '%')
                            ->orWhere('generic_name', 'like', '%' . $search . '%'),
                        );
                    })
                    // Exact or partial date match (expects YYYY-MM-DD fragments)
                    ->orWhere('dispense_date', 'like', '%' . $search . '%');
                });
            })
            ->latest('dispense_date')
            ->latest('id')
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('dispense-records/index', [
            'records' => $records,
            'search'  => $search,
        ]);
    }

    public function create(): Response
    {
        $patients = Patient::orderBy('patient_name')->get(['id', 'patient_name']);
        $doctors  = Doctor::orderBy('doctor_name')->get(['id', 'doctor_license_no', 'doctor_name']);
        $medicines = Medicine::orderBy('medicine_brand')
            ->get(['id', 'medicine_sku', 'medicine_brand', 'generic_name', 'dosage_mg', 'dosage_form', 'stock_quantity', 'unit_price']);

        return Inertia::render('dispense-records/form', [
            'patients'  => $patients,
            'doctors'   => $doctors,
            'medicines' => $medicines,
            'record'    => null,
            ...$this->dispenseDateLimits(),
        ]);
    }

    public function store(StoreDispenseRecordRequest $request): RedirectResponse
    {
        $this->service->createDispenseRecord($request->validated());

        return redirect()
            ->route('dispense-records.index')
            ->with('success', 'Dispensing record created successfully.');
    }

    public function edit(DispenseRecord $dispense_record): Response
    {
        $dispense_record->load('items.medicine');

        // Only active (non-deleted) patients and doctors appear in the dropdowns.
        // A record that references a soft-deleted patient/doctor can still be
        // viewed and its medicines updated, but the user cannot re-select the
        // archived person — they must first restore that record via the database.
        $patients = Patient::orderBy('patient_name')
            ->get(['id', 'patient_name']);

        $doctors = Doctor::orderBy('doctor_name')
            ->get(['id', 'doctor_license_no', 'doctor_name']);

        $previousMedicineIds = $dispense_record->items->pluck('medicine_id');
        $medicines = Medicine::withTrashed()
            ->where(function ($query) use ($previousMedicineIds) {
                $query->whereNull('deleted_at')
                    ->orWhereIn('id', $previousMedicineIds);
            })
            ->orderBy('medicine_brand')
            ->get(['id', 'medicine_sku', 'medicine_brand', 'generic_name', 'dosage_mg', 'dosage_form', 'stock_quantity', 'unit_price', 'deleted_at']);

        return Inertia::render('dispense-records/form', [
            'patients'  => $patients,
            'doctors'   => $doctors,
            'medicines' => $medicines,
            'record'    => $dispense_record,
            ...$this->dispenseDateLimits(),
        ]);
    }

    public function update(
        UpdateDispenseRecordRequest $request,
        DispenseRecord $dispense_record,
    ): RedirectResponse {
        $this->service->updateDispenseRecord($dispense_record->id, $request->validated());

        return redirect()
            ->route('dispense-records.index')
            ->with('success', 'Dispensing record updated successfully.');
    }

    public function destroy(DispenseRecord $dispense_record): RedirectResponse
    {
        // Soft-delete only.  Stock is NOT reversed — the medicines were
        // physically dispensed and the inventory deduction stands.
        $dispense_record->delete();

        return redirect()
            ->route('dispense-records.index')
            ->with('success', 'Dispensing record deleted successfully.');
    }

    // -------------------------------------------------------------------------

    private function dispenseDateLimits(): array
    {
        $today = now(config('app.timezone'));

        return [
            'minDispenseDate' => $today->toDateString(),
            'maxDispenseDate' => $today->copy()->addMonthNoOverflow()->toDateString(),
        ];
    }
}
