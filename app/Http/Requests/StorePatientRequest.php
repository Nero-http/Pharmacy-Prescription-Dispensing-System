<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('patients', 'patient_name')->where(
                    fn ($query) => $query->whereRaw('LOWER(patient_name) = ?', [mb_strtolower(trim($this->input('patient_name')))])
                ),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_name.required' => 'The patient name is required.',
            'patient_name.unique' => 'A patient with this name already exists.',
        ];
    }
}
