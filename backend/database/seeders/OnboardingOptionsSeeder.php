<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\LearningGoal;
use App\Models\School;
use Illuminate\Database\Seeder;

class OnboardingOptionsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Countries ──────────────────────────────────────────────────────
        $countries = [
            ['name' => 'Kenya', 'code' => 'KE'],
            ['name' => 'Uganda', 'code' => 'UG'],
            ['name' => 'Tanzania', 'code' => 'TZ'],
            ['name' => 'Rwanda', 'code' => 'RW'],
            ['name' => 'Nigeria', 'code' => 'NG'],
            ['name' => 'Ghana', 'code' => 'GH'],
            ['name' => 'South Africa', 'code' => 'ZA'],
            ['name' => 'United Kingdom', 'code' => 'GB'],
            ['name' => 'United States', 'code' => 'US'],
            ['name' => 'Canada', 'code' => 'CA'],
            ['name' => 'India', 'code' => 'IN'],
            ['name' => 'Other', 'code' => null],
        ];

        $countryModels = [];
        foreach ($countries as $i => $c) {
            $countryModels[$c['name']] = Country::firstOrCreate(
                ['name' => $c['name']],
                ['code' => $c['code'], 'is_active' => true, 'sort_order' => $i]
            );
        }

        // ── Schools (managed list, scoped to country) ──────────────────────
        $schools = [
            'Kenya' => [
                ['name' => 'Alliance High School', 'city' => 'Kikuyu', 'type' => 'Secondary'],
                ['name' => 'Nairobi School', 'city' => 'Nairobi', 'type' => 'Secondary'],
                ['name' => 'Kenya High School', 'city' => 'Nairobi', 'type' => 'Secondary'],
                ['name' => 'Mang\'u High School', 'city' => 'Thika', 'type' => 'Secondary'],
                ['name' => 'Starehe Boys\' Centre', 'city' => 'Nairobi', 'type' => 'Secondary'],
                ['name' => 'University of Nairobi', 'city' => 'Nairobi', 'type' => 'University'],
                ['name' => 'Kenyatta University', 'city' => 'Nairobi', 'type' => 'University'],
                ['name' => 'Jomo Kenyatta University of Agriculture and Technology', 'city' => 'Juja', 'type' => 'University'],
                ['name' => 'Strathmore University', 'city' => 'Nairobi', 'type' => 'University'],
                ['name' => 'Moi University', 'city' => 'Eldoret', 'type' => 'University'],
            ],
            'Uganda' => [
                ['name' => 'Makerere University', 'city' => 'Kampala', 'type' => 'University'],
                ['name' => 'King\'s College Budo', 'city' => 'Wakiso', 'type' => 'Secondary'],
            ],
            'United Kingdom' => [
                ['name' => 'University of Oxford', 'city' => 'Oxford', 'type' => 'University'],
                ['name' => 'University of Cambridge', 'city' => 'Cambridge', 'type' => 'University'],
            ],
            'United States' => [
                ['name' => 'Harvard University', 'city' => 'Cambridge', 'type' => 'University'],
                ['name' => 'Massachusetts Institute of Technology', 'city' => 'Cambridge', 'type' => 'University'],
            ],
        ];

        foreach ($schools as $countryName => $list) {
            $country = $countryModels[$countryName] ?? null;
            if (!$country) {
                continue;
            }
            foreach ($list as $i => $s) {
                School::firstOrCreate(
                    ['country_id' => $country->id, 'name' => $s['name']],
                    ['city' => $s['city'] ?? null, 'type' => $s['type'] ?? null, 'is_active' => true, 'sort_order' => $i]
                );
            }
        }

        // ── Learning goals ─────────────────────────────────────────────────
        $goals = [
            'Improve grades',
            'Exam preparation',
            'Learn new skills',
            'Career development',
            'Explore new subjects',
            'Academic competitions',
            'University preparation',
            'Catch up on coursework',
        ];

        foreach ($goals as $i => $label) {
            LearningGoal::firstOrCreate(
                ['label' => $label],
                ['is_active' => true, 'sort_order' => $i]
            );
        }
    }
}
