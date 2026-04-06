<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Education & Study Tips',
                'description' => 'Strategies, techniques, and advice to help students learn more effectively.',
                'color_hex'   => '#4F46E5',
                'sort_order'  => 1,
            ],
            [
                'name'        => 'Technology in Learning',
                'description' => 'How technology and digital tools are transforming the education landscape.',
                'color_hex'   => '#7C3AED',
                'sort_order'  => 2,
            ],
            [
                'name'        => 'Career Guidance & Mentorship',
                'description' => 'Insights and advice for career planning, professional development, and mentorship.',
                'color_hex'   => '#059669',
                'sort_order'  => 3,
            ],
            [
                'name'        => 'Platform News & Updates',
                'description' => 'The latest news, features, and announcements from EduBridge Learn.',
                'color_hex'   => '#DC2626',
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Science & STEM',
                'description' => 'Deep dives into science, technology, engineering, and mathematics topics.',
                'color_hex'   => '#0891B2',
                'sort_order'  => 5,
            ],
            [
                'name'        => 'Mathematics',
                'description' => 'Math concepts, problem-solving techniques, and curriculum-aligned guides.',
                'color_hex'   => '#D97706',
                'sort_order'  => 6,
            ],
            [
                'name'        => 'Languages & Humanities',
                'description' => 'Essays, writing skills, literature, history, and social sciences.',
                'color_hex'   => '#BE185D',
                'sort_order'  => 7,
            ],
            [
                'name'        => 'CBC & Kenya Curriculum',
                'description' => 'Resources and discussions aligned to the Kenyan CBC syllabus and KICD guidelines.',
                'color_hex'   => '#16A34A',
                'sort_order'  => 8,
            ],
        ];

        foreach ($categories as $category) {
            BlogCategory::firstOrCreate(
                ['slug' => Str::slug($category['name'])],
                $category
            );
        }
    }
}
