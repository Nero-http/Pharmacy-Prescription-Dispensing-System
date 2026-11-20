<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Doctor;
use App\Services\DomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function __construct(private DomainService $service) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $doctors = Doctor::query()
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('doctor_name', 'like', '%' . $search . '%')
                  ->orWhere('doctor_license_no', 'like', '%' . $search . '%');
            }))
            ->orderBy('doctor_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('doctors/index', [
            'doctors' => $doctors,
            'search'  => $search,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('doctors/form', ['doctor' => null]);
    }

    public function store(StoreDoctorRequest $request): JsonResponse|RedirectResponse
    {
        $doctor = $this->service->createDoctor($request->validated());

        // JSON requests come from the inline dispense-record form.
        if ($request->expectsJson()) {
            return response()->json([
                'doctor' => $doctor->only(['id', 'doctor_name', 'doctor_license_no']),
            ], 201);
        }

        return redirect()
            ->route('doctors.index')
            ->with('success', 'Doctor added successfully.');
    }

    public function edit(Doctor $doctor): Response
    {
        return Inertia::render('doctors/form', [
            'doctor' => $doctor->only(['id', 'doctor_name', 'doctor_license_no']),
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): JsonResponse|RedirectResponse
    {
        $doctor = $this->service->updateDoctor($doctor, $request->validated());

        // JSON requests come from the inline dispense-record form.
        if ($request->expectsJson()) {
            return response()->json([
                'doctor' => $doctor->only(['id', 'doctor_name', 'doctor_license_no']),
            ]);
        }

        return redirect()
            ->route('doctors.index')
            ->with('success', 'Doctor updated successfully.');
    }

    public function destroy(Doctor $doctor): RedirectResponse
    {
        $doctor->delete();

        return redirect()
            ->route('doctors.index')
            ->with('success', 'Doctor deleted successfully.');
    }
}
