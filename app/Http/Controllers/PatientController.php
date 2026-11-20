<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\DomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(private DomainService $service) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $patients = Patient::query()
            ->when($search !== '', fn ($q) => $q->where('patient_name', 'like', '%' . $search . '%'))
            ->orderBy('patient_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'search'   => $search,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/form', ['patient' => null]);
    }

    public function store(StorePatientRequest $request): JsonResponse|RedirectResponse
    {
        $patient = $this->service->createPatient($request->validated());

        // JSON requests come from the inline dispense-record form.
        if ($request->expectsJson()) {
            return response()->json([
                'patient' => $patient->only(['id', 'patient_name']),
            ], 201);
        }

        return redirect()
            ->route('patients.index')
            ->with('success', 'Patient added successfully.');
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/form', ['patient' => $patient->only(['id', 'patient_name'])]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse|RedirectResponse
    {
        $patient = $this->service->updatePatient($patient, $request->validated());

        // JSON requests come from the inline dispense-record form.
        if ($request->expectsJson()) {
            return response()->json([
                'patient' => $patient->only(['id', 'patient_name']),
            ]);
        }

        return redirect()
            ->route('patients.index')
            ->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $patient->delete();

        return redirect()
            ->route('patients.index')
            ->with('success', 'Patient deleted successfully.');
    }
}
