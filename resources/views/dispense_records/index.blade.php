
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Dispensing Records</h1>

    <p>
        <a href="{{ route('dispense-records.create') }}">
            + Create Dispensing Record
        </a>
    </p>

    @if ($dispenseRecords->count())
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">ID</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Patient</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Doctor</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">License No.</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Date</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Medicines</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Total</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd;">Action</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach ($dispenseRecords as $record)
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                #{{ $dispenseRecords->firstItem() + $loop->index }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                {{ $record->patient->patient_name ?? 'N/A' }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                {{ $record->doctor->doctor_name ?? 'N/A' }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                {{ $record->doctor->doctor_license_no ?? 'N/A' }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                {{ $record->dispense_date?->format('Y-m-d') }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                @foreach ($record->items as $item)
                                    <div>
                                        {{ $item->medicine->medicine_brand ?? 'Unknown medicine' }}
                                        × {{ $item->quantity_dispensed }}
                                    </div>
                                @endforeach
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                ₱{{ number_format(
                                    $record->items->sum('total_price'),
                                    2
                                ) }}
                            </td>

                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="{{ route('dispense-records.edit', $record->id) }}">
                                    Edit
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div style="margin-top: 20px;">
            {{ $dispenseRecords->links() }}
        </div>
    @else
        <p>No dispensing records found.</p>
    @endif
</div>
@endsection
