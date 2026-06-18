<?php

namespace Database\Seeders;

use App\Models\ContributorProfile;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Super Admin
        DB::transaction(function () {
            $superAdmin = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => 'Super Admin',
                'email' => 'superadmin@edubridge.com',
                'password' => Hash::make('SuperAdmin@123'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'country' => 'Kenya',
                'timezone' => 'Africa/Nairobi',
            ]);

            $this->command->info("Super Admin created: {$superAdmin->email}");
        });

        // Admin
        DB::transaction(function () {
            $admin = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => 'Admin User',
                'email' => 'admin@edubridge.com',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'country' => 'Kenya',
                'timezone' => 'Africa/Nairobi',
            ]);

            $this->command->info("Admin created: {$admin->email}");
        });

        // Student (onboarding completed)
        DB::transaction(function () {
            $student = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => 'Jane Student',
                'email' => 'student@edubridge.com',
                'password' => Hash::make('Student@123'),
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
                'country' => 'Kenya',
                'timezone' => 'Africa/Nairobi',
            ]);

            StudentProfile::create([
                'user_id' => $student->id,
                'education_level' => 'cbc_senior_secondary',
                'curriculum' => 'CBC',
                'grade' => 'Grade 11',
                'institution' => 'Nairobi High School',
                'subjects' => ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
                'learning_goals' => ['Exam Preparation', 'Improve Grades', 'Understand Concepts'],
                'onboarding_completed' => true,
            ]);

            $this->command->info("Student created: {$student->email}");
        });

        // Tutor (approved, visible in search)
        DB::transaction(function () {
            $tutor = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => 'John Tutor',
                'email' => 'tutor@edubridge.com',
                'password' => Hash::make('Tutor@123'),
                'role' => 'tutor',
                'status' => 'active',
                'email_verified_at' => now(),
                'country' => 'Kenya',
                'timezone' => 'Africa/Nairobi',
            ]);

            TutorProfile::create([
                'user_id' => $tutor->id,
                'bio' => 'Experienced mathematics and physics tutor with over 8 years of teaching experience. I specialize in helping students understand complex concepts through practical examples and structured problem-solving techniques.',
                'qualifications' => [
                    ['title' => 'BSc Mathematics', 'institution' => 'University of Nairobi', 'year' => 2015],
                    ['title' => 'PGDE Education', 'institution' => 'Kenyatta University', 'year' => 2016],
                ],
                'experience_years' => 8,
                'subjects' => ['Mathematics', 'Physics', 'Chemistry'],
                'hourly_rate' => 25.00,
                'rate_currency' => 'USD',
                'teaching_methodology' => 'I use a student-centered approach, combining visual aids, real-world examples, and interactive problem-solving sessions to make learning engaging and effective.',
                'verification_status' => 'approved',
                'verified_at' => now(),
                'avg_rating' => 4.80,
                'total_sessions' => 42,
            ]);

            $this->command->info("Tutor created: {$tutor->email}");
        });

        // Extra demo tutors (approved, searchable)
        DB::transaction(function () {
            $tutors = [
                [
                    'name' => 'Sarah Wanjiku',
                    'email' => 'sarah.tutor@edubridge.com',
                    'country' => 'Kenya',
                    'bio' => 'Passionate Biology and Chemistry tutor helping A-level and KCSE students excel. Strong focus on exam technique and past paper practice.',
                    'subjects' => ['Biology', 'Chemistry'],
                    'hourly_rate' => 20.00,
                    'experience_years' => 5,
                    'avg_rating' => 4.60,
                    'total_sessions' => 28,
                    'qualifications' => [['title' => 'BSc Biochemistry', 'institution' => 'Egerton University', 'year' => 2018]],
                ],
                [
                    'name' => 'David Omondi',
                    'email' => 'david.tutor@edubridge.com',
                    'country' => 'Kenya',
                    'bio' => 'English and Literature specialist with a passion for helping students develop strong writing and analytical skills. 10 years experience.',
                    'subjects' => ['English', 'Literature'],
                    'hourly_rate' => 18.00,
                    'experience_years' => 10,
                    'avg_rating' => 4.90,
                    'total_sessions' => 115,
                    'qualifications' => [['title' => 'BA English Literature', 'institution' => 'University of Nairobi', 'year' => 2013]],
                ],
                [
                    'name' => 'Amina Hassan',
                    'email' => 'amina.tutor@edubridge.com',
                    'country' => 'Kenya',
                    'bio' => 'Mathematics and Further Maths tutor. I break down complex topics into simple, digestible steps. KCSE, IGCSE and IB experience.',
                    'subjects' => ['Mathematics'],
                    'hourly_rate' => 30.00,
                    'experience_years' => 7,
                    'avg_rating' => 4.70,
                    'total_sessions' => 76,
                    'qualifications' => [['title' => 'MSc Applied Mathematics', 'institution' => 'JKUAT', 'year' => 2016]],
                ],
            ];

            foreach ($tutors as $t) {
                $user = User::create([
                    'uuid' => (string) Str::uuid(),
                    'name' => $t['name'],
                    'email' => $t['email'],
                    'password' => Hash::make('Tutor@123'),
                    'role' => 'tutor',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'country' => $t['country'],
                    'timezone' => 'Africa/Nairobi',
                ]);

                TutorProfile::create([
                    'user_id' => $user->id,
                    'bio' => $t['bio'],
                    'qualifications' => $t['qualifications'],
                    'experience_years' => $t['experience_years'],
                    'subjects' => $t['subjects'],
                    'hourly_rate' => $t['hourly_rate'],
                    'rate_currency' => 'USD',
                    'verification_status' => 'approved',
                    'verified_at' => now(),
                    'avg_rating' => $t['avg_rating'],
                    'total_sessions' => $t['total_sessions'],
                ]);

                $this->command->info("Demo tutor created: {$user->email}");
            }
        });

        // Contributor (pending approval, profile filled)
        DB::transaction(function () {
            $contributor = User::create([
                'uuid' => (string) Str::uuid(),
                'name' => 'Alice Contributor',
                'email' => 'contributor@edubridge.com',
                'password' => Hash::make('Contributor@123'),
                'role' => 'contributor',
                'status' => 'pending_approval',
                'email_verified_at' => now(),
                'country' => 'Kenya',
                'timezone' => 'Africa/Nairobi',
            ]);

            ContributorProfile::create([
                'user_id' => $contributor->id,
                'bio' => 'Passionate educator and content creator with expertise in STEM subjects. I create high-quality study materials, practice questions, and past paper compilations to help students excel in their exams.',
                'expertise_areas' => ['Mathematics', 'Science', 'Technology', 'CBC Curriculum'],
                'verification_status' => 'pending',
                'total_resources' => 0,
            ]);

            $this->command->info("Contributor created: {$contributor->email}");
        });

        $this->command->info('');
        $this->command->info('=== Seed Credentials ===');
        $this->command->info('Super Admin : superadmin@edubridge.com / SuperAdmin@123');
        $this->command->info('Admin       : admin@edubridge.com / Admin@123');
        $this->command->info('Student     : student@edubridge.com / Student@123');
        $this->command->info('Tutor       : tutor@edubridge.com / Tutor@123 (approved)');
        $this->command->info('Demo Tutors : sarah/david/amina.tutor@edubridge.com / Tutor@123');
        $this->command->info('Contributor : contributor@edubridge.com / Contributor@123 (pending approval)');
        $this->command->info('========================');

        // Seed curriculum taxonomy (database-driven subjects)
        $this->call(CurriculumSeeder::class);
        $this->command->info('Curriculum data seeded.');

        // Seed onboarding option lists (countries, schools, learning goals)
        $this->call(OnboardingOptionsSeeder::class);
        $this->command->info('Onboarding options seeded.');

        // Seed subscription plans
        $this->call(SubscriptionPlanSeeder::class);
        $this->command->info('Subscription plans seeded.');

        // Seed blog categories
        $this->call(BlogCategorySeeder::class);
        $this->command->info('Blog categories seeded.');
    }
}
