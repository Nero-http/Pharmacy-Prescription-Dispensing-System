
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Add Medicine</h1>

    @if ($errors->any())
        <div class="error-box">
            <strong>Please correct the following errors:</strong>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('medicines.store') }}" method="POST">
        @csrf

        <div class="form-group">
            <label for="medicine_sku">Medicine SKU</label>
            <input
                type="text"
                id="medicine_sku"
                name="medicine_sku"
                value="{{ old('medicine_sku') }}"
                maxlength="100"
                pattern="[A-Za-z0-9_-]+"
                title="Use letters, numbers, hyphens, and underscores only."
                required
            >
        </div>

        <div class="form-group">
            <label for="medicine_brand">Medicine Brand</label>
            <input
                type="text"
                id="medicine_brand"
                name="medicine_brand"
                value="{{ old('medicine_brand') }}"
                maxlength="255"
                required
            >
        </div>

        <div class="form-group">
            <label for="generic_name">Generic Name</label>
            <input
                type="text"
                id="generic_name"
                name="generic_name"
                value="{{ old('generic_name') }}"
                maxlength="255"
                required
            >
        </div>

        <div class="form-group">
            <label for="dosage_mg">Dosage (mg)</label>
            <input
                type="number"
                id="dosage_mg"
                name="dosage_mg"
                value="{{ old('dosage_mg') }}"
                min="1"
                max="100000"
                step="1"
                required
            >
        </div>

        <div class="form-group">
            <label for="stock_quantity">Stock Quantity</label>
            <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value="{{ old('stock_quantity', 0) }}"
                min="0"
                max="100000"
                step="1"
                required
            >
            <small>Enter a whole number from 0 to 100,000.</small>
        </div>

        <div class="form-group">
            <label for="unit_price">Unit Price (₱)</label>
            <input
                type="number"
                id="unit_price"
                name="unit_price"
                value="{{ old('unit_price') }}"
                min="0"
                max="99999999.99"
                step="0.01"
                required
            >
        </div>

        <button type="submit">Save Medicine</button>
        <a href="{{ route('medicines.index') }}">Cancel</a>
    </form>
</div>

<style>
    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 6px;
    }

    .form-group input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .form-group small {
        display: block;
        margin-top: 5px;
    }

    .error-box {
        padding: 12px;
        margin-bottom: 16px;
        color: #b91c1c;
        border: 1px solid #ef4444;
        border-radius: 5px;
    }

    button {
        padding: 10px 16px;
        cursor: pointer;
    }
</style>
@endsection
