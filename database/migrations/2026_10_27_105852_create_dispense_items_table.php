<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispense_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('dispense_record_id')
                ->constrained('dispense_records')
                ->onDelete('cascade');

            $table->foreignId('medicine_id')
                ->constrained('medicines')
                ->onDelete('restrict');

            $table->unsignedInteger('quantity_dispensed');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();

            $table->unique([
                'dispense_record_id',
                'medicine_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispense_items');
    }
};