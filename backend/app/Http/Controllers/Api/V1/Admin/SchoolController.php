<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $schools = School::with('country:id,name')
            ->when($request->filled('country_id'), fn($q) => $q->where('country_id', $request->integer('country_id')))
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', '%' . $request->string('search') . '%'))
            ->orderBy('country_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $schools]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $school = School::create($data);

        return response()->json([
            'data' => $school->load('country:id,name'),
            'meta' => ['message' => 'School created.'],
        ], 201);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $data = $request->validate([
            'country_id' => ['sometimes', 'integer', 'exists:countries,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $school->update($data);

        return response()->json([
            'data' => $school->fresh()->load('country:id,name'),
            'meta' => ['message' => 'School updated.'],
        ]);
    }

    public function destroy(School $school): JsonResponse
    {
        $school->delete();

        return response()->json(['meta' => ['message' => 'School deleted.']]);
    }
}
