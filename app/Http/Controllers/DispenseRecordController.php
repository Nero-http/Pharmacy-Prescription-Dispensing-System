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
use Inertia\Inertia;
use Inertia\Response;

class DispenseRecordController extends Controller
{
    public function __construct(
        private DomainService $service
    ) {}

    public function index(): Response
    {
        $records = DispenseRecord::with([
            'patient',
            'doctor',
            'items.medicine',
        ])
            ->latest('dispense_date')
            ->latest('id')
            ->paginate(10);

        return Inertia::render('dispense-records/index', [
            'records' => $records,
        ]);
    }

    public function create(): Response
    {
        $patients = Patient::orderBy('patient_name')
            ->get(['id', 'patient_name']);
        $doctors = Doctor::orderBy('doctor_name')
            ->get(['id', 'doctor_license_no', 'doctor_name']);
        $medicines = Medicine::orderBy('medicine_brand')
            ->get(['id', 'medicine_sku', 'medicine_brand', 'generic_name', 'dosage_mg', 'stock_quantity', 'unit_price']);

        return Inertia::render('dispense-records/form', [
            'patients' => $patients,
            'doctors' => $doctors,
            'medicines' => $medicines,
            'record' => null,
        ]);
    }

    public function store(
        StoreDispenseRecordRequest $request
    ): RedirectResponse {
        $this->service->createDispenseRecord($request->validated());

        return redirect()
            ->route('dispense-records.index')
            ->with('success', 'Dispensing record created successfully.');
    }

    public function edit(DispenseRecord $dispense_record): Response
    {
        $dispense_record->load('items.medicine');

        $patients = Patient::orderBy('patient_name')
            ->get(['id', 'patient_name']);
        $doctors = Doctor::orderBy('doctor_name')
            ->get(['id', 'doctor_license_no', 'doctor_name']);
        $medicines = Medicine::orderBy('medicine_brand')
            ->get(['id', 'medicine_sku', 'medicine_brand', 'generic_name', 'dosage_mg', 'stock_quantity', 'unit_price']);

        return Inertia::render('dispense-records/form', [
            'patients' => $patients,
            'doctors' => $doctors,
            'medicines' => $medicines,
            'record' => $dispense_record,
        ]);
    }

    public function update(
        UpdateDispenseRecordRequest $request,
        DispenseRecord $dispense_record
    ): RedirectResponse {
        $this->service->updateDispenseRecord(
            $dispense_record->id,
            $request->validated()
        );

        return redirect()
            ->route('dispense-records.index')
            ->with('success', 'Dispensing record updated successfully.');
    }
}
