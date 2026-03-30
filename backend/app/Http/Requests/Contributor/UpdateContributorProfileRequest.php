<?php

namespace App\Http\Requests\Contributor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContributorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string', 'max:2000'],
            'expertise_areas' => ['nullable', 'array'],
            'expertise_areas.*' => ['string', 'max:100'],
        ];
    }
}
