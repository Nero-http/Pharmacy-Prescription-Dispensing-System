<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DispenseRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'dispense_date',
    ];

    protected function casts(): array
    {
        return [
            'dispense_date' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DispenseItem::class);
    }
}