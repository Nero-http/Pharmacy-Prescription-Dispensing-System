<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $fillable = [
        'doctor_license_no',
        'doctor_name',
    ];

    public function dispenseRecords(): HasMany
    {
        return $this->hasMany(DispenseRecord::class);
    }
}