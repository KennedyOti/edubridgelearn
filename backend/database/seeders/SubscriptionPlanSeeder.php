<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Get started with basic access to the platform.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'USD',
                'ai_queries_per_day' => 20,
                'recorded_lessons_per_month' => 0,
                'live_sessions_per_month' => 0,
                'includes_all_lessons' => false,
                'priority_support' => false,
                'features' => [
                    'Community access',
                    'Free resources',
                    '20 AI queries/day',
                    'Basic dashboard',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Unlimited AI tutoring and recorded lesson access.',
                'price_monthly' => 499, // $4.99 in cents
                'price_yearly' => 4990, // $49.90 in cents
                'currency' => 'USD',
                'ai_queries_per_day' => -1, // Unlimited
                'recorded_lessons_per_month' => 5,
                'live_sessions_per_month' => 0,
                'includes_all_lessons' => false,
                'priority_support' => false,
                'features' => [
                    'Everything in Free',
                    'Unlimited AI Teacher',
                    '5 recorded lessons/month',
                    'Resource discounts (10%)',
                    'Progress tracking',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Full platform access with live tutoring sessions.',
                'price_monthly' => 1499, // $14.99 in cents
                'price_yearly' => 14990,
                'currency' => 'USD',
                'ai_queries_per_day' => -1,
                'recorded_lessons_per_month' => -1, // Unlimited
                'live_sessions_per_month' => 2,
                'includes_all_lessons' => true,
                'priority_support' => true,
                'features' => [
                    'Everything in Basic',
                    '2 live sessions/month',
                    'All recorded lessons',
                    'Priority support',
                    'Resource discounts (20%)',
                    'Gamification features',
                    'Offline content access',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Institutional',
                'slug' => 'institutional',
                'description' => 'Bulk licenses for schools and institutions. Custom pricing.',
                'price_monthly' => 0, // Custom - handled manually
                'price_yearly' => 0,
                'currency' => 'USD',
                'ai_queries_per_day' => -1,
                'recorded_lessons_per_month' => -1,
                'live_sessions_per_month' => -1,
                'includes_all_lessons' => true,
                'priority_support' => true,
                'features' => [
                    'Everything in Premium',
                    'Unlimited live sessions',
                    'Custom curriculum',
                    'Admin dashboard',
                    'Analytics & reporting',
                    'White-label option',
                    'LTI integration',
                    'Dedicated account manager',
                ],
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
