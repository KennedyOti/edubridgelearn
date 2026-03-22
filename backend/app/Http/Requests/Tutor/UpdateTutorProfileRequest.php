<?php

namespace App\Http\Requests\Tutor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTutorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string', 'max:2000'],
            'qualifications' => ['nullable', 'array'],
            'qualifications.*.title' => ['required_with:qualifications', 'string', 'max:255'],
            'qualifications.*.institution' => ['nullable', 'string', 'max:255'],
            'qualifications.*.year' => ['nullable', 'integer', 'min:1950', 'max:2030'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
            'subjects' => ['nullable', 'array'],
            'subjects.*' => ['string', 'max:100'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'rate_currency' => ['nullable', 'string', 'size:3'],
            'intro_video_url' => ['nullable', 'url', 'max:500'],
            'teaching_methodology' => ['nullable', 'string', 'max:5000'],
            'availability' => ['nullable', 'array'],
        ];
    }
}
