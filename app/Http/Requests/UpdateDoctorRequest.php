<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'doctor_license_no' => is_string($this->input('doctor_license_no'))
                ? mb_strtoupper(trim($this->input('doctor_license_no')))
                : $this->input('doctor_license_no'),
        ]);
    }

    public function rules(): array
    {
        return [
            'doctor_name' => ['required', 'string', 'max:255'],
            'doctor_license_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('doctors', 'doctor_license_no')->ignore($this->route('doctor')),
            ],
        ];
    }
}
