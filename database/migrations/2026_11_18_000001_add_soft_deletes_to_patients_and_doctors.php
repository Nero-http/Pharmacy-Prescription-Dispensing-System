<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('patients') && ! Schema::hasColumn('patients', 'deleted_at')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasTable('doctors') && ! Schema::hasColumn('doctors', 'deleted_at')) {
            Schema::table('doctors', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
