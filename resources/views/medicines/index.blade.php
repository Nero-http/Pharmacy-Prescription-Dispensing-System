
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Medicine Inventory</h1>

    <p>
        <a href="{{ route('medicines.create') }}">+ Add Medicine</a>
    </p>

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

    @if ($medicines->count())
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Brand</th>
                        <th>Generic Name</th>
                        <th>Dosage (mg)</th>
                        <th>Stock</th>
                        <th>Unit Price</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach ($medicines as $medicine)
                        <tr>
                            <td>{{ $medicine->medicine_sku }}</td>
                            <td>{{ $medicine->medicine_brand }}</td>
                            <td>{{ $medicine->generic_name }}</td>
                            <td>{{ $medicine->dosage_mg }}</td>
                            <td>{{ $medicine->stock_quantity }}</td>
                            <td>₱{{ number_format($medicine->unit_price, 2) }}</td>
                            <td>
                                <details>
                                    <summary>Edit</summary>

                                    <form
                                        action="{{ route('medicines.update', $medicine->id) }}"
                                        method="POST"
                                        class="edit-form"
                                    >
                                        @csrf
                                        @method('PUT')

                                        <label>Medicine SKU</label>
                                        <input
                                            type="text"
                                            name="medicine_sku"
                                            value="{{ $medicine->medicine_sku }}"
                                            maxlength="100"
                                            pattern="[A-Za-z0-9_-]+"
                                            title="Use letters, numbers, hyphens, and underscores only."
                                            required
                                        >

                                        <label>Medicine Brand</label>
                                        <input
                                            type="text"
                                            name="medicine_brand"
                                            value="{{ $medicine->medicine_brand }}"
                                            maxlength="255"
                                            required
                                        >

                                        <label>Generic Name</label>
                                        <input
                                            type="text"
                                            name="generic_name"
                                            value="{{ $medicine->generic_name }}"
                                            maxlength="255"
                                            required
                                        >

                                        <label>Dosage (mg)</label>
                                        <input
                                            type="number"
                                            name="dosage_mg"
                                            value="{{ $medicine->dosage_mg }}"
                                            min="1"
                                            max="100000"
                                            step="1"
                                            required
                                        >

                                        <label>Stock Quantity</label>
                                        <input
                                            type="number"
                                            name="stock_quantity"
                                            value="{{ $medicine->stock_quantity }}"
                                            min="0"
                                            max="100000"
                                            step="1"
                                            required
                                        >

                                        <label>Unit Price (₱)</label>
                                        <input
                                            type="number"
                                            name="unit_price"
                                            value="{{ $medicine->unit_price }}"
                                            min="0"
                                            max="10000"
                                            step="0.01"
                                            required
                                        >

                                        <button type="submit">Update Medicine</button>
                                    </form>
                                </details>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="pagination">
            {{ $medicines->links() }}
        </div>
    @else
        <p>No medicines found. Add your first medicine to begin.</p>
    @endif
</div>

<style>
    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }

    .edit-form {
        min-width: 230px;
        padding: 12px 0;
    }

    .edit-form label {
        display: block;
        margin-top: 10px;
        font-weight: bold;
    }

    .edit-form input {
        box-sizing: border-box;
        width: 100%;
        padding: 8px;
        margin-top: 4px;
    }

    .edit-form button {
        margin-top: 12px;
        padding: 8px 12px;
        cursor: pointer;
    }

    .error-box {
        padding: 12px;
        margin-bottom: 16px;
        color: #b91c1c;
        border: 1px solid #ef4444;
        border-radius: 5px;
    }

    .pagination {
        margin-top: 20px;
    }
</style>
@endsection
