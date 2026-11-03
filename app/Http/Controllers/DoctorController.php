<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Doctor;
use App\Services\DomainService;
use Illuminate\Http\JsonResponse;

class DoctorController extends Controller
{
    public function __construct(private DomainService $service) {}

    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $doctor = $this->service->createDoctor($request->validated());

        return response()->json([
            'doctor' => $doctor->only(['id', 'doctor_name', 'doctor_license_no']),
        ], 201);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): JsonResponse
    {
        $doctor = $this->service->updateDoctor($doctor, $request->validated());

        return response()->json([
            'doctor' => $doctor->only(['id', 'doctor_name', 'doctor_license_no']),
        ]);
    }
}
