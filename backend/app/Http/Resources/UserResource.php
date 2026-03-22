<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status,
            'country' => $this->country,
            'timezone' => $this->timezone,
            'avatar_url' => $this->avatar_url,
            'email_verified' => !is_null($this->email_verified_at),
            'two_factor_enabled' => $this->two_factor_enabled,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'student_profile' => new StudentProfileResource($this->whenLoaded('studentProfile')),
            'tutor_profile' => new TutorProfileResource($this->whenLoaded('tutorProfile')),
            'contributor_profile' => new ContributorProfileResource($this->whenLoaded('contributorProfile')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
