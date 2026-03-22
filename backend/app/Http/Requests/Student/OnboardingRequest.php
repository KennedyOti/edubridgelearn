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
            'education_level' => ['required', 'string', 'in:cbc_primary,cbc_junior_secondary,cbc_senior_secondary,british,american,ib,college,university,lifelong_learner'],
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
