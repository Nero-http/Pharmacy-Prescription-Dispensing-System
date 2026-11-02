<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispense_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->onDelete('restrict');

            $table->foreignId('doctor_id')
                ->constrained('doctors')
                ->onDelete('restrict');

            $table->date('dispense_date');
            $table->timestamps();

            $table->index('dispense_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispense_records');
    }
};