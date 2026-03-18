<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'bio' => $this->bio,
            'qualifications' => $this->qualifications,
            'experience_years' => $this->experience_years,
            'subjects' => $this->subjects,
            'hourly_rate' => $this->hourly_rate,
            'rate_currency' => $this->rate_currency,
            'intro_video_url' => $this->intro_video_url,
            'teaching_methodology' => $this->teaching_methodology,
            'verification_status' => $this->verification_status,
            'rejection_reason' => $this->when($this->verification_status === 'rejected', $this->rejection_reason),
            'verified_at' => $this->verified_at?->toISOString(),
            'avg_rating' => (float) $this->avg_rating,
            'total_sessions' => $this->total_sessions,
            'availability' => $this->availability,
        ];
    }
}
