<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The `education_level` column was an ENUM tied to a fixed, outdated list
     * of curriculum codes. Education levels are now database-driven (the
     * `education_levels` table), so the column must accept any level code.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE `student_profiles` MODIFY `education_level` VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `student_profiles` MODIFY `education_level` ENUM('cbc_primary','cbc_junior_secondary','cbc_senior_secondary','british','american','ib','college','university','lifelong_learner') NULL");
    }
};
