<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\OnboardingRequest;
use App\Http\Resources\StudentProfileResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function completeOnboarding(OnboardingRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json([
                'errors' => [['message' => 'Only students can complete onboarding.']],
            ], 403);
        }

        $profile = $user->studentProfile;
        if (!$profile) {
            $profile = $user->studentProfile()->create([]);
        }

        // Update user country if provided
        if ($request->has('country')) {
            $user->update(['country' => $request->country]);
        }

        $profile->update([
            ...$request->validated(),
            'onboarding_completed' => true,
        ]);

        return response()->json([
            'data' => new UserResource($user->load('studentProfile')),
            'meta' => ['message' => 'Onboarding completed successfully.'],
        ]);
    }

    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => new StudentProfileResource($user->studentProfile),
        ]);
    }

    public function updateProfile(OnboardingRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            return response()->json([
                'errors' => [['message' => 'Student profile not found.']],
            ], 404);
        }

        if ($request->has('country')) {
            $user->update(['country' => $request->country]);
        }

        $profile->update($request->validated());

        return response()->json([
            'data' => new StudentProfileResource($profile->fresh()),
            'meta' => ['message' => 'Profile updated.'],
        ]);
    }

    public function getSubjectsByLevel(string $level): JsonResponse
    {
        $subjects = $this->getSubjectsForLevel($level);

        return response()->json([
            'data' => $subjects,
        ]);
    }

    public function getCurriculumOptions(): JsonResponse
    {
        return response()->json([
            'data' => [
                'education_levels' => [
                    ['value' => 'cbc_primary', 'label' => 'CBC Primary (Grades 1-6)', 'group' => 'Kenya CBC'],
                    ['value' => 'cbc_junior_secondary', 'label' => 'CBC Junior Secondary (Grades 7-9)', 'group' => 'Kenya CBC'],
                    ['value' => 'cbc_senior_secondary', 'label' => 'CBC Senior Secondary (Grades 10-12)', 'group' => 'Kenya CBC'],
                    ['value' => 'british', 'label' => 'British (A-Levels/GCSEs)', 'group' => 'International'],
                    ['value' => 'american', 'label' => 'American (AP/SAT)', 'group' => 'International'],
                    ['value' => 'ib', 'label' => 'International Baccalaureate', 'group' => 'International'],
                    ['value' => 'college', 'label' => 'College (Diploma/Certificate/TVET)', 'group' => 'Higher Education'],
                    ['value' => 'university', 'label' => 'University (Undergrad/Postgrad)', 'group' => 'Higher Education'],
                    ['value' => 'lifelong_learner', 'label' => 'Lifelong Learner', 'group' => 'Professional'],
                ],
                'grades' => [
                    'cbc_primary' => ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
                    'cbc_junior_secondary' => ['Grade 7', 'Grade 8', 'Grade 9'],
                    'cbc_senior_secondary' => ['Grade 10', 'Grade 11', 'Grade 12'],
                    'british' => ['Year 7', 'Year 8', 'Year 9', 'GCSE Year 10', 'GCSE Year 11', 'AS Level', 'A Level'],
                    'american' => ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
                    'ib' => ['Pre-IB Year 1', 'Pre-IB Year 2', 'IB Year 1', 'IB Year 2'],
                    'college' => ['Year 1', 'Year 2', 'Year 3'],
                    'university' => ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate'],
                ],
            ],
        ]);
    }

    private function getSubjectsForLevel(string $level): array
    {
        $subjects = [
            'cbc_primary' => ['Mathematics', 'English', 'Kiswahili', 'Science & Technology', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education'],
            'cbc_junior_secondary' => ['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Pre-Technical Studies', 'Agriculture', 'Creative Arts & Sports', 'Computer Science'],
            'cbc_senior_secondary' => ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Business Studies', 'Computer Science', 'Agriculture', 'Home Science'],
            'british' => ['Mathematics', 'English Literature', 'English Language', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Economics', 'Business Studies', 'Computer Science', 'Psychology', 'Sociology'],
            'american' => ['AP Calculus', 'AP Biology', 'AP Chemistry', 'AP Physics', 'AP English', 'AP History', 'AP Computer Science', 'SAT Math', 'SAT English', 'AP Economics', 'AP Psychology'],
            'ib' => ['Mathematics', 'English A', 'Biology', 'Chemistry', 'Physics', 'History', 'Economics', 'Psychology', 'Computer Science', 'Theory of Knowledge', 'Extended Essay'],
            'college' => ['Business Management', 'Information Technology', 'Engineering', 'Health Sciences', 'Hospitality', 'Education', 'Agriculture', 'Social Work'],
            'university' => ['Computer Science', 'Engineering', 'Medicine', 'Law', 'Business Administration', 'Economics', 'Education', 'Sciences', 'Arts & Humanities', 'Social Sciences'],
            'lifelong_learner' => ['Programming', 'Data Science', 'Digital Marketing', 'Project Management', 'Design', 'Languages', 'Finance', 'Leadership', 'Communication'],
        ];

        return $subjects[$level] ?? [];
    }
}
