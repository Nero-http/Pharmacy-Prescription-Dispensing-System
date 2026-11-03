<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\DomainService;
use Illuminate\Http\JsonResponse;

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
}
