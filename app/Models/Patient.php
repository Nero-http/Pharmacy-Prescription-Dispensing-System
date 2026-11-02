<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $fillable = [
        'patient_name',
    ];

    public function dispenseRecords(): HasMany
    {
        return $this->hasMany(DispenseRecord::class);
    }
}