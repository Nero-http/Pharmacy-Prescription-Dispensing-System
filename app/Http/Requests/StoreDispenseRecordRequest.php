<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDispenseRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'dispense_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => [
                'required',
                'integer',
                'distinct',
                'exists:medicines,id',
            ],
            'items.*.quantity_dispensed' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'Please select a patient.',
            'patient_id.integer' => 'The selected patient is invalid.',
            'patient_id.exists' => 'The selected patient does not exist.',
            'doctor_id.required' => 'Please select a doctor.',
            'doctor_id.integer' => 'The selected doctor is invalid.',
            'doctor_id.exists' => 'The selected doctor does not exist.',
            'dispense_date.required' => 'The dispensing date is required.',
            'dispense_date.date' => 'Please enter a valid dispensing date.',
            'items.required' => 'Please add at least one medicine.',
            'items.array' => 'The medicines must be submitted as a list.',
            'items.min' => 'Please add at least one medicine.',
            'items.*.medicine_id.required' => 'Please select a medicine.',
            'items.*.medicine_id.integer' => 'The selected medicine is invalid.',
            'items.*.medicine_id.distinct' => 'A medicine cannot be added more than once.',
            'items.*.medicine_id.exists' => 'The selected medicine does not exist.',
            'items.*.quantity_dispensed.required' => 'The quantity is required.',
            'items.*.quantity_dispensed.integer' => 'The quantity must be a whole number.',
            'items.*.quantity_dispensed.min' => 'The quantity must be at least 1.',
        ];
    }
}
