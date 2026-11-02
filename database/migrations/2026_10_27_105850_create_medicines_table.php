<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('medicine_sku')->unique();
            $table->string('medicine_brand');
            $table->string('generic_name');
            $table->unsignedInteger('dosage_mg');
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};