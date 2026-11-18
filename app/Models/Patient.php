<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_name',
    ];

    public function dispenseRecords(): HasMany
    {
        return $this->hasMany(DispenseRecord::class);
    }
}