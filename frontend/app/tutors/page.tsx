"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import {
  Search, Filter, MapPin, Clock, BadgeCheck,
  ChevronLeft, ChevronRight, BookOpen, Users,
  GraduationCap, SlidersHorizontal, X, Loader2,
} from "lucide-react";
import Link from "next/link";

interface TutorSubject {
  id: number;
  name: string;
  education_level?: string;
}

interface TutorResult {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  profile: {
    bio: string | null;
    experience_years: number | null;
    hourly_rate: number;
    rate_currency: string;
    avg_rating: number;
    total_sessions: number;
    subjects: TutorSubject[];
  };
}

interface CurriculumOption {
  id: number;
  value: string;
  label: string;
  group: string;
}

interface SubjectOption {
  id: number;
  name: string;
}

export default function FindTutorPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<TutorResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levels, setLevels] = useState<CurriculumOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load curriculum levels
  useEffect(() => {
    api.get("/curriculum/options").then(({ data }) => {
      setLevels(data.data.education_levels ?? []);
    }).catch(() => {});
  }, []);

  // Load subjects when level changes
  useEffect(() => {
    setSelectedSubject("");
    if (selectedLevel) {
      api.get(`/curriculum/subjects/${selectedLevel}`).then(({ data }) => {
        setSubjects(data.data ?? []);
      }).catch(() => {});
    } else {
      setSubjects([]);
    }
  }, [selectedLevel]);

  const fetchTutors = async (pg = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 12, page: pg };
      if (selectedSubject) params.subject_id = selectedSubject;
      if (minRating) params.min_rating = minRating;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const { data } = await api.get("/tutors/search", { params });
      setTutors(data.data ?? []);
      setTotalPages(data.meta?.last_page ?? 1);
      setTotal(data.meta?.total ?? 0);
      setPage(pg);
    } catch {
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, minRating, minPrice, maxPrice]);

  const clearFilters = () => {
    setSelectedLevel("");
    setSelectedSubject("");
    setMinRating("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  const hasActiveFilters = selectedLevel || selectedSubject || minRating || minPrice || maxPrice;

  const filtered = search
    ? tutors.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.profile.subjects?.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : tutors;

  return (
    <DashboardLayout title="Find a Tutor">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find a Tutor</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {total > 0 ? `${total} verified tutors available` : "Search for expert tutors"}
            </p>
          </div>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${hasActiveFilters
                ? "border-primary bg-primary-50 text-primary"
                : "border-border bg-white text-muted-foreground hover:bg-muted"}
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {[selectedSubject, minRating, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tutors by name or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Filter Tutors</span>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-error hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Education Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                placeholder="Any level"
                options={levels.map((l) => ({ value: l.value, label: l.label }))}
              />
              <Select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="Any subject"
                options={subjects.map((s) => ({ value: String(s.id), label: s.name }))}
                disabled={!selectedLevel}
              />
              <Select
                label="Minimum Rating"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="Any rating"
                options={[
                  { value: "4.5", label: "⭐ 4.5 & above" },
                  { value: "4.0", label: "⭐ 4.0 & above" },
                  { value: "3.5", label: "⭐ 3.5 & above" },
                  { value: "3.0", label: "⭐ 3.0 & above" },
                ]}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Price Range ($/hr)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-muted-foreground text-sm">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Finding tutors…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No tutors found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} onBook={() => router.push(`/book/${tutor.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTutors(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchTutors(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Tutor Card ───────────────────────────────────────────────────────────────

function TutorCard({ tutor, onBook }: { tutor: TutorResult; onBook: () => void }) {
  const initials = tutor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="relative p-5 pb-4">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            {tutor.avatar_url ? (
              <img src={tutor.avatar_url} alt={tutor.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" title="Online" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground truncate">{tutor.name}</h3>
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
            </div>
            {tutor.country && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3" />
                {tutor.country}
              </div>
            )}
            <Rating
              value={tutor.profile.avg_rating}
              reviewCount={tutor.profile.total_sessions}
              size="sm"
              className="mt-1.5"
            />
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold text-foreground">
              {tutor.profile.rate_currency} {tutor.profile.hourly_rate ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {tutor.profile.bio && (
        <div className="px-5">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {tutor.profile.bio}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 py-3 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 mt-3">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{tutor.profile.total_sessions} sessions</span>
        </div>
        {tutor.profile.experience_years && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{tutor.profile.experience_years} yrs exp</span>
          </div>
        )}
      </div>

      {/* Subjects */}
      {tutor.profile.subjects?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {tutor.profile.subjects.slice(0, 3).map((s) => (
            <Badge key={s.id} variant="default" className="text-[10px] px-2 py-0.5">
              {s.name}
            </Badge>
          ))}
          {tutor.profile.subjects.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              +{tutor.profile.subjects.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-0 mt-auto flex items-center gap-2">
        <Link
          href={`/tutors/${tutor.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          View Profile
        </Link>
        <Button size="sm" onClick={onBook} className="flex-1">
          Book Session
        </Button>
      </div>
    </div>
  );
}
