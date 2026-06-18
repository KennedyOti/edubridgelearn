<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'education_level' => ['required', 'string', 'exists:education_levels,code'],
            'curriculum' => ['nullable', 'string', 'max:100'],
            'grade' => ['nullable', 'string', 'max:50'],
            'institution' => ['nullable', 'string', 'max:255'],
            'subjects' => ['nullable', 'array'],
            'subjects.*' => ['string', 'max:100'],
            'learning_goals' => ['nullable', 'array'],
            'learning_goals.*' => ['string', 'max:500'],
            'preferred_schedule' => ['nullable', 'array'],
            'country' => ['nullable', 'string', 'max:100'],
        ];
    }
}
