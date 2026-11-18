<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'doctor_license_no',
        'doctor_name',
    ];

    public function dispenseRecords(): HasMany
    {
        return $this->hasMany(DispenseRecord::class);
    }

    protected function doctorName(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): string => trim((string) preg_replace('/\s*\[PPDS Demo\]\s*$/i', '', $value ?? '')),
        );
    }
}