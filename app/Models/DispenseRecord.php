<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DispenseRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'dispense_date',
    ];

    protected function casts(): array
    {
        return [
            // Use date:Y-m-d so JSON serialisation always produces 'YYYY-MM-DD'
            // instead of a full ISO-8601 timestamp.  This fixes the index table
            // date column showing "2026-10-05T00:00:00.000000Z".
            'dispense_date' => 'date:Y-m-d',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class)->withTrashed();
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class)->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(DispenseItem::class);
    }
}
