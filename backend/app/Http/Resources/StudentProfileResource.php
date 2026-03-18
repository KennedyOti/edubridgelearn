<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'education_level' => $this->education_level,
            'curriculum' => $this->curriculum,
            'grade' => $this->grade,
            'institution' => $this->institution,
            'subjects' => $this->subjects,
            'learning_goals' => $this->learning_goals,
            'preferred_schedule' => $this->preferred_schedule,
            'onboarding_completed' => $this->onboarding_completed,
        ];
    }
}
