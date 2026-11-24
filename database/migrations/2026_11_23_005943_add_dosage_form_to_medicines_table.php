<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('medicines') && ! Schema::hasColumn('medicines', 'dosage_form')) {
            Schema::table('medicines', function (Blueprint $table) {
                // Nullable so existing rows get NULL and are not broken.
                // A sensible default ('tablet') can be set via the application
                // when creating new records.
                $table->string('dosage_form')->nullable()->after('dosage_mg');
            });
        }
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn('dosage_form');
        });
    }
};
