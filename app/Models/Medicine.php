<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    protected $fillable = [
        'medicine_sku',
        'medicine_brand',
        'generic_name',
        'dosage_mg',
        'stock_quantity',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'dosage_mg' => 'integer',
            'stock_quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function dispenseItems(): HasMany
    {
        return $this->hasMany(DispenseItem::class);
    }
}