<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispenseItem extends Model
{
    protected $fillable = [
        'dispense_record_id',
        'medicine_id',
        'quantity_dispensed',
        'unit_price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity_dispensed' => 'integer',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function dispenseRecord(): BelongsTo
    {
        return $this->belongsTo(DispenseRecord::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }
}