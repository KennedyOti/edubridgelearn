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
  Search, Play, Clock, Users, BookOpen, Lock, Unlock,
  SlidersHorizontal, X, Loader2, GraduationCap, Star,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  access_type: "free" | "subscription" | "paid";
  price: number | null;
  currency: string | null;
  avg_rating: number;
  total_reviews: number;
  total_views: number;
  subject: { id: number; name: string } | null;
  topic: { id: number; name: string } | null;
  tutor: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  user_progress?: {
    watched_seconds: number;
    is_completed: boolean;
  } | null;
  has_access: boolean;
}

interface CurriculumOption {
  value: string;
  label: string;
  group: string;
}

interface SubjectOption {
  id: number;
  name: string;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [levels, setLevels] = useState<CurriculumOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [accessType, setAccessType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get("/curriculum/options")
      .then(({ data }) => setLevels(data.data.education_levels ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedSubject("");
    if (selectedLevel) {
      api.get(`/curriculum/subjects/${selectedLevel}`)
        .then(({ data }) => setSubjects(data.data ?? []))
        .catch(() => {});
    } else {
      setSubjects([]);
    }
  }, [selectedLevel]);

  const fetchLessons = async (pg = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 12, page: pg, sort: sortBy };
      if (selectedSubject) params.subject_id = selectedSubject;
      if (accessType) params.access_type = accessType;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/lessons", { params });
      setLessons(data.data ?? []);
      setTotalPages(data.meta?.last_page ?? 1);
      setTotal(data.meta?.total ?? 0);
      setPage(pg);
    } catch {
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, accessType, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons(1);
  };

  const clearFilters = () => {
    setSelectedLevel("");
    setSelectedSubject("");
    setAccessType("");
    setSortBy("newest");
    setSearch("");
  };

  const hasFilters = selectedSubject || accessType || sortBy !== "newest";

  return (
    <DashboardLayout title="Recorded Lessons">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recorded Lessons</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {total > 0 ? `${total} lessons available` : "Explore expert-led lessons"}
            </p>
          </div>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${hasFilters
                ? "border-primary bg-primary-50 text-primary"
                : "border-border bg-white text-muted-foreground hover:bg-muted"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {[selectedSubject, accessType].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons by title or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-24 py-3 rounded-2xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); fetchLessons(1); }}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Filter Lessons</span>
              </div>
              {hasFilters && (
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
                label="Access Type"
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                placeholder="All types"
                options={[
                  { value: "free", label: "Free" },
                  { value: "subscription", label: "Subscription" },
                  { value: "paid", label: "Paid" },
                ]}
              />
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                placeholder="Sort"
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "popular", label: "Most Popular" },
                  { value: "rating", label: "Top Rated" },
                  { value: "price_asc", label: "Price: Low to High" },
                ]}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading lessons…</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No lessons found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => router.push(`/lessons/${lesson.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLessons(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLessons(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
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

// ─── Lesson Card ──────────────────────────────────────────────────────────────

function LessonCard({ lesson, onClick }: { lesson: Lesson; onClick: () => void }) {
  const progress = lesson.user_progress
    ? lesson.duration_seconds
      ? Math.round((lesson.user_progress.watched_seconds / lesson.duration_seconds) * 100)
      : 0
    : null;

  const tutorInitials = lesson.tutor.name
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const accessBadge = {
    free: { label: "Free", variant: "success" as const, icon: Unlock },
    subscription: { label: "Subscription", variant: "info" as const, icon: Star },
    paid: { label: `${lesson.currency ?? "$"}${((lesson.price ?? 0) / 100).toFixed(2)}`, variant: "default" as const, icon: Lock },
  }[lesson.access_type];

  const AccessIcon = accessBadge.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {lesson.thumbnail_url ? (
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-primary/20" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-primary ml-1" />
          </div>
        </div>

        {/* Access badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={accessBadge.variant} className="text-xs gap-1">
            <AccessIcon className="w-3 h-3" />
            {accessBadge.label}
          </Badge>
        </div>

        {/* Duration */}
        {lesson.duration_seconds && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-medium">
            {formatDuration(lesson.duration_seconds)}
          </div>
        )}

        {/* Progress bar */}
        {progress !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Subject/topic */}
        {(lesson.subject || lesson.topic) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {lesson.subject && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {lesson.subject.name}
              </Badge>
            )}
            {lesson.topic && (
              <span className="text-[10px] text-muted-foreground">{lesson.topic.name}</span>
            )}
          </div>
        )}

        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
          {lesson.title}
        </h3>

        {/* Tutor */}
        <div className="flex items-center gap-2">
          {lesson.tutor.avatar_url ? (
            <img
              src={lesson.tutor.avatar_url}
              alt={lesson.tutor.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-[9px] font-bold text-primary">
              {tutorInitials}
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">{lesson.tutor.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <Rating
            value={lesson.avg_rating}
            reviewCount={lesson.total_reviews}
            size="sm"
            showValue={lesson.total_reviews > 0}
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {lesson.total_views.toLocaleString()}
          </div>
        </div>

        {/* Progress label */}
        {lesson.user_progress?.is_completed && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            Completed
          </div>
        )}
        {progress !== null && !lesson.user_progress?.is_completed && progress > 0 && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <div className="flex-1 bg-muted rounded-full h-1.5">
              <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
