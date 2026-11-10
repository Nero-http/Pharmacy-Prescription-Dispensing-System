<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $medicine = $this->route('medicine');

        $medicineId = is_object($medicine)
            ? $medicine->id
            : $medicine;

        return [
            'medicine_sku' => [
                'required',
                'string',
                'max:100',
                'regex:/\A[A-Za-z0-9_-]+\z/',
                Rule::unique('medicines', 'medicine_sku')
                    ->ignore($medicineId),
            ],

            'medicine_brand' => [
                'required',
                'string',
                'max:255',
                "regex:~\A[\pL\pN\s.,()+/'-]+\z~u",
            ],

            'generic_name' => [
                'required',
                'string',
                'max:255',
                "regex:~\A[\pL\pN\s.,()+/'-]+\z~u",
            ],

            'dosage_mg' => [
                'required',
                'integer',
                'min:1',
                'max:100000',
            ],

            'stock_quantity' => [
                'required',
                'integer',
                'min:0',
                'max:100000',
            ],

            'unit_price' => [
                'required',
                'numeric',
                'min:0',
                'max:10000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'medicine_sku.required' =>
                'The medicine SKU is required.',
            'medicine_sku.regex' =>
                'SKU may contain only letters, numbers, hyphens, and underscores.',
            'medicine_sku.unique' =>
                'This medicine SKU already exists.',
            'medicine_brand.regex' =>
                'The medicine brand contains unsupported characters.',
            'generic_name.regex' =>
                'The generic name contains unsupported characters.',
            'dosage_mg.min' =>
                'Dosage must be at least 1 mg.',
            'dosage_mg.max' =>
                'Dosage cannot exceed 100,000 mg.',
            'stock_quantity.min' =>
                'Stock quantity cannot be negative.',
            'stock_quantity.max' =>
                'Stock quantity cannot exceed 100,000 units.',
            'unit_price.min' =>
                'Unit price cannot be negative.',
            'unit_price.max' =>
                'Unit price cannot exceed 10,000.',
        ];
    }
}
