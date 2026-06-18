<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index(): JsonResponse
    {
        $countries = Country::withCount('schools')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $countries]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name'],
            'code' => ['nullable', 'string', 'size:2'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $country = Country::create($data);

        return response()->json([
            'data' => $country,
            'meta' => ['message' => 'Country created.'],
        ], 201);
    }

    public function update(Request $request, Country $country): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100', 'unique:countries,name,' . $country->id],
            'code' => ['nullable', 'string', 'size:2'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $country->update($data);

        return response()->json([
            'data' => $country->fresh(),
            'meta' => ['message' => 'Country updated.'],
        ]);
    }

    public function destroy(Country $country): JsonResponse
    {
        $country->delete();

        return response()->json(['meta' => ['message' => 'Country deleted.']]);
    }
}
