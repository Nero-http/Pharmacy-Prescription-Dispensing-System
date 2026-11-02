
@extends('layouts.app')

@section('title', 'Edit Dispensing Record')

@section('content')
@php
    $oldItems = old('items');

    $initialItems = is_array($oldItems)
        ? $oldItems
        : $dispense_record->items->map(fn ($item) => [
            'medicine_id' => $item->medicine_id,
            'quantity_dispensed' => $item->quantity_dispensed,
        ])->values()->all();

    if (count($initialItems) === 0) {
        $initialItems = [
            ['medicine_id' => '', 'quantity_dispensed' => 1],
        ];
    }

    $nextIndex = max(array_map('intval', array_keys($initialItems))) + 1;
@endphp

<div class="container">
    <h1>Edit Dispensing Record #{{ $dispense_record->id }}</h1>

    @if ($errors->any())
        <div class="error-summary">
            <strong>Please correct the following errors:</strong>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="card">
        <form
            action="{{ route('dispense-records.update', $dispense_record->id) }}"
            method="POST"
        >
            @csrf
            @method('PUT')

            <div class="form-group">
                <label for="patient_id">Patient</label>
                <select name="patient_id" id="patient_id" required>
                    @foreach ($patients as $patient)
                        <option
                            value="{{ $patient->id }}"
                            @selected(old('patient_id', $dispense_record->patient_id) == $patient->id)
                        >
                            {{ $patient->patient_name }}
                        </option>
                    @endforeach
                </select>

                @error('patient_id')
                    <p class="error">{{ $message }}</p>
                @enderror
            </div>

            <div class="form-group">
                <label for="doctor_id">Doctor</label>
                <select name="doctor_id" id="doctor_id" required>
                    @foreach ($doctors as $doctor)
                        <option
                            value="{{ $doctor->id }}"
                            @selected(old('doctor_id', $dispense_record->doctor_id) == $doctor->id)
                        >
                            {{ $doctor->doctor_name }}
                            ({{ $doctor->doctor_license_no }})
                        </option>
                    @endforeach
                </select>

                @error('doctor_id')
                    <p class="error">{{ $message }}</p>
                @enderror
            </div>

            <div class="form-group">
                <label for="dispense_date">Dispensing Date</label>
                <input
                    type="date"
                    name="dispense_date"
                    id="dispense_date"
                    value="{{ old('dispense_date', $dispense_record->dispense_date?->format('Y-m-d')) }}"
                    required
                >

                @error('dispense_date')
                    <p class="error">{{ $message }}</p>
                @enderror
            </div>

            <hr>

            <h2>Medicines</h2>
            <p>Choose the medicines and quantities for this record.</p>

            <div id="medicine-rows">
                @foreach ($initialItems as $index => $item)
                    <div class="medicine-row">
                        <div class="form-group">
                            <label for="medicine_{{ $index }}">Medicine</label>

                            <select
                                id="medicine_{{ $index }}"
                                name="items[{{ $index }}][medicine_id]"
                                required
                            >
                                <option value="">Select a medicine</option>

                                @foreach ($medicines as $medicine)
                                    <option
                                        value="{{ $medicine->id }}"
                                        @selected(($item['medicine_id'] ?? '') == $medicine->id)
                                    >
                                        {{ $medicine->medicine_brand }}
                                        — {{ $medicine->generic_name }}
                                        — Stock: {{ $medicine->stock_quantity }}
                                        — ₱{{ number_format((float) $medicine->unit_price, 2) }}
                                    </option>
                                @endforeach
                            </select>

                            @error("items.$index.medicine_id")
                                <p class="error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="quantity_{{ $index }}">Quantity</label>

                            <input
                                id="quantity_{{ $index }}"
                                type="number"
                                name="items[{{ $index }}][quantity_dispensed]"
                                min="1"
                                value="{{ $item['quantity_dispensed'] ?? 1 }}"
                                required
                            >

                            @error("items.$index.quantity_dispensed")
                                <p class="error">{{ $message }}</p>
                            @enderror
                        </div>

                        <button
                            type="button"
                            class="remove-row btn btn-secondary"
                        >
                            Remove Medicine
                        </button>
                    </div>
                @endforeach
            </div>

            @error('items')
                <p class="error">{{ $message }}</p>
            @enderror

            <button
                type="button"
                id="add-medicine"
                class="btn btn-secondary"
            >
                + Add Another Medicine
            </button>

            <div class="form-actions">
                <button type="submit">Update Dispensing Record</button>

                <a
                    href="{{ route('dispense-records.index') }}"
                    class="btn btn-secondary"
                >
                    Cancel
                </a>
            </div>
        </form>
    </div>
</div>

<style>
    .card {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: bold;
    }

    .form-group select,
    .form-group input {
        width: 100%;
        padding: 9px;
        box-sizing: border-box;
    }

    .medicine-row {
        padding: 15px;
        margin: 15px 0;
        border: 1px solid #ddd;
        border-radius: 6px;
    }

    .form-actions {
        margin-top: 20px;
    }

    .error,
    .error-summary {
        color: #b91c1c;
    }

    .error-summary {
        padding: 12px;
        margin-bottom: 16px;
        border: 1px solid #ef9a9a;
        border-radius: 6px;
    }

    button {
        cursor: pointer;
        padding: 9px 12px;
        margin: 4px;
    }
</style>

<script>
    let nextIndex = {{ $nextIndex }};

    const medicineOptions = {{ Illuminate\Support\Js::from(
        $medicines->map(function ($medicine) {
            return [
                'id' => $medicine->id,
                'brand' => $medicine->medicine_brand,
                'generic' => $medicine->generic_name,
                'stock' => $medicine->stock_quantity,
                'price' => number_format((float) $medicine->unit_price, 2, '.', ''),
            ];
        })->values()
    ) }};

    const container = document.getElementById('medicine-rows');

    document.getElementById('add-medicine').addEventListener('click', function () {
        const row = document.createElement('div');
        row.className = 'medicine-row';

        const medicineGroup = document.createElement('div');
        medicineGroup.className = 'form-group';

        const medicineLabel = document.createElement('label');
        medicineLabel.htmlFor = `medicine_${nextIndex}`;
        medicineLabel.textContent = 'Medicine';

        const medicineSelect = document.createElement('select');
        medicineSelect.id = `medicine_${nextIndex}`;
        medicineSelect.name = `items[${nextIndex}][medicine_id]`;
        medicineSelect.required = true;

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select a medicine';
        medicineSelect.appendChild(placeholder);

        medicineOptions.forEach(function (medicine) {
            const option = document.createElement('option');
            option.value = medicine.id;
            option.textContent =
                `${medicine.brand} — ${medicine.generic} — Stock: ${medicine.stock} — ₱${medicine.price}`;
            medicineSelect.appendChild(option);
        });

        medicineGroup.append(medicineLabel, medicineSelect);

        const quantityGroup = document.createElement('div');
        quantityGroup.className = 'form-group';

        const quantityLabel = document.createElement('label');
        quantityLabel.htmlFor = `quantity_${nextIndex}`;
        quantityLabel.textContent = 'Quantity';

        const quantityInput = document.createElement('input');
        quantityInput.id = `quantity_${nextIndex}`;
        quantityInput.type = 'number';
        quantityInput.name = `items[${nextIndex}][quantity_dispensed]`;
        quantityInput.min = '1';
        quantityInput.value = '1';
        quantityInput.required = true;

        quantityGroup.append(quantityLabel, quantityInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-row btn btn-secondary';
        removeButton.textContent = 'Remove Medicine';

        row.append(medicineGroup, quantityGroup, removeButton);
        container.appendChild(row);

        nextIndex++;
    });

    container.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-row')) {
            if (container.querySelectorAll('.medicine-row').length > 1) {
                event.target.closest('.medicine-row').remove();
            } else {
                alert('At least one medicine is required.');
            }
        }
    });
</script>
@endsection
