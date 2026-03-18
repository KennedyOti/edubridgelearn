<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'bio' => $this->bio,
            'expertise_areas' => $this->expertise_areas,
            'verification_status' => $this->verification_status,
            'total_resources' => $this->total_resources,
        ];
    }
}
