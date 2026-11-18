<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\DomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(private DomainService $service) {}

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = $this->service->createPatient($request->validated());

        return response()->json([
            'patient' => $patient->only(['id', 'patient_name']),
        ], 201);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $patient = $this->service->updatePatient($patient, $request->validated());

        return response()->json([
            'patient' => $patient->only(['id', 'patient_name']),
        ]);
    }

    public function destroy(Request $request, Patient $patient): JsonResponse
    {
        abort_unless($request->user()?->is_admin, 403, 'Only administrators can delete patients.');

        $patient->delete();

        return response()->json([
            'message' => 'Patient deleted successfully.',
        ]);
    }
}
