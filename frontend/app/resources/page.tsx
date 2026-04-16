"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  Search, Filter, BookOpen, FileText, FlaskConical, ClipboardList,
  GraduationCap, Layers, Cpu, Download, Star, ChevronLeft, ChevronRight,
  Upload, ShoppingCart, CheckCircle, SlidersHorizontal, X, TrendingUp,
  BookMarked, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  type_label: string;
  access_type: "free" | "purchase" | "subscription";
  price: number;
  price_formatted: string;
  currency: string;
  avg_rating: number;
  downloads_count: number;
  purchases_count: number;
  file_size_label: string;
  preview_url: string | null;
  exam_year: number | null;
  examining_body: string | null;
  is_purchased: boolean;
  published_at: string;
  creator: { id: string; name: string; avatar_url: string | null; role: string };
  subject: { id: number; name: string } | null;
  education_level: { id: number; name: string } | null;
  curriculum: { id: number; name: string; code: string | null } | null;
  tags: { id: number; name: string; slug: string }[];
}

interface FilterOption { id: number; name: string; code?: string | null }
interface Meta { total: number; current_page: number; last_page: number; per_page: number }

// ── Constants ─────────────────────────────────────────────────────────────────

const RESOURCE_TYPES = [
  { value: "notes",              label: "Notes & Study Guides",   icon: BookOpen },
  { value: "practice_questions", label: "Practice Questions",     icon: ClipboardList },
  { value: "assignment",         label: "Assignments",            icon: FileText },
  { value: "past_paper",         label: "Past Exam Papers",       icon: GraduationCap },
  { value: "flashcard_deck",     label: "Flashcard Decks",        icon: Layers },
  { value: "simulation",         label: "Interactive Simulations",icon: Cpu },
  { value: "worksheet",          label: "Worksheets",             icon: FlaskConical },
];

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "popular",   label: "Most Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc",label: "Price: High → Low" },
];

const ACCESS_TYPES = [
  { value: "",             label: "All Resources" },
  { value: "free",         label: "Free" },
  { value: "purchase",     label: "Paid" },
  { value: "subscription", label: "Subscription" },
];

// ── Type icon helper ──────────────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const t = RESOURCE_TYPES.find((r) => r.value === type);
  const Icon = t?.icon ?? BookOpen;
  return <Icon className={className} />;
}

// ── Type color helper ─────────────────────────────────────────────────────────

function typeColor(type: string): string {
  const map: Record<string, string> = {
    notes:              "bg-primary/10 text-primary",
    practice_questions: "bg-accent/10 text-accent",
    assignment:         "bg-secondary/10 text-secondary-dark",
    past_paper:         "bg-highlight/10 text-highlight",
    flashcard_deck:     "bg-info/10 text-info",
    simulation:         "bg-success/10 text-success",
    worksheet:          "bg-warning/10 text-warning",
  };
  return map[type] ?? "bg-muted text-muted-foreground";
}

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("w-3 h-3", s <= Math.round(rating) ? "fill-secondary text-secondary" : "text-muted-foreground/40")}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-0.5">
        {rating > 0 ? rating.toFixed(1) : "No reviews"}
        {count > 0 && ` (${count})`}
      </span>
    </div>
  );
}

// ── Resource Card ─────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
  const isFree = resource.access_type === "free";
  const isPaid = resource.access_type === "purchase";

  return (
    <Link href={`/resources/${resource.id}`}>
      <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 flex flex-col h-full cursor-pointer">
        {/* Thumbnail / type banner */}
        <div className={cn("h-36 flex items-center justify-center relative overflow-hidden", typeColor(resource.type))}>
          {resource.preview_url ? (
            <img
              src={resource.preview_url}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            />
          ) : (
            <TypeIcon type={resource.type} className="w-14 h-14 opacity-20" />
          )}
          {/* Access badge */}
          <div className="absolute top-2 right-2">
            {isFree ? (
              <span className="bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
            ) : isPaid ? (
              <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {resource.price_formatted}
              </span>
            ) : (
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SUB</span>
            )}
          </div>
          {/* Purchased badge */}
          {resource.is_purchased && (
            <div className="absolute top-2 left-2">
              <span className="bg-success/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Owned
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Type pill */}
          <div className="flex items-center justify-between gap-2">
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", typeColor(resource.type))}>
              <TypeIcon type={resource.type} className="w-2.5 h-2.5" />
              {resource.type_label}
            </span>
            {resource.exam_year && (
              <span className="text-[10px] text-muted-foreground font-medium">{resource.exam_year}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{resource.description}</p>
          )}

          {/* Subject & level */}
          {(resource.subject || resource.education_level) && (
            <div className="flex flex-wrap gap-1">
              {resource.subject && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {resource.subject.name}
                </span>
              )}
              {resource.education_level && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {resource.education_level.name}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          <StarRating rating={resource.avg_rating} count={resource.purchases_count} />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                {resource.creator.name.charAt(0)}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[90px]">{resource.creator.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {resource.downloads_count}</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{resource.file_size_label}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ResourceSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-3.5 bg-muted rounded" />
        <div className="h-3.5 bg-muted rounded w-2/3" />
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="h-3.5 bg-muted rounded w-20" />
          <div className="h-3.5 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl w-full px-6">
          {Array.from({ length: 9 }).map((_, i) => <ResourceSkeleton key={i} />)}
        </div>
      </div>
    }>
      <ResourcesPageInner />
    </Suspense>
  );
}

function ResourcesPageInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user }    = useAuthStore();

  const [resources, setResources] = useState<Resource[]>([]);
  const [meta, setMeta]           = useState<Meta>({ total: 0, current_page: 1, last_page: 1, per_page: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search,     setSearch]     = useState(searchParams.get("search") ?? "");
  const [type,       setType]       = useState(searchParams.get("type") ?? "");
  const [accessType, setAccessType] = useState(searchParams.get("access_type") ?? "");
  const [sort,       setSort]       = useState(searchParams.get("sort") ?? "newest");
  const [page,       setPage]       = useState(Number(searchParams.get("page") ?? 1));

  // Taxonomy filter state
  const [curricula,       setCurricula]       = useState<FilterOption[]>([]);
  const [educationLevels, setEducationLevels] = useState<FilterOption[]>([]);
  const [subjects,        setSubjects]        = useState<FilterOption[]>([]);
  const [curriculumId,    setCurriculumId]    = useState(searchParams.get("curriculum_id") ?? "");
  const [levelId,         setLevelId]         = useState(searchParams.get("education_level_id") ?? "");
  const [subjectId,       setSubjectId]       = useState(searchParams.get("subject_id") ?? "");

  const canUpload = user && ["tutor", "contributor", "admin", "super_admin"].includes(user.role);

  // Fetch taxonomy options
  useEffect(() => {
    api.get("/curricula").then(({ data }) => setCurricula(data.data ?? [])).catch(() => {});
    api.get("/curriculum/options").then(({ data }) => {
      if (data.data?.education_levels) setEducationLevels(data.data.education_levels);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (curriculumId) {
      api.get(`/curriculum/levels/${curriculumId}/subjects`).then(({ data }) => {
        setSubjects(data.data ?? []);
      }).catch(() => setSubjects([]));
    } else {
      setSubjects([]);
      setSubjectId("");
    }
  }, [curriculumId]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 12, page, sort };
      if (search) params.search = search;
      if (type) params.type = type;
      if (accessType) params.access_type = accessType;
      if (curriculumId) params.curriculum_id = curriculumId;
      if (levelId) params.education_level_id = levelId;
      if (subjectId) params.subject_id = subjectId;

      const { data } = await api.get("/resources", { params });
      setResources(data.data);
      setMeta(data.meta);
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, type, accessType, sort, page, curriculumId, levelId, subjectId]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setType(""); setAccessType(""); setCurriculumId(""); setLevelId(""); setSubjectId(""); setSearch(""); setPage(1);
  };

  const activeFilterCount = [type, accessType, curriculumId, levelId, subjectId].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">

        {/* ── Hero header ── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookMarked className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Learning Resources</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Resource Marketplace</h1>
                <p className="text-muted-foreground mt-1 text-sm max-w-xl">
                  Curated study materials, past papers, practice questions, and more — created by verified educators.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user && (
                  <Link href="/resources/purchased">
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="w-4 h-4" /> My Purchases
                    </Button>
                  </Link>
                )}
                {canUpload && (
                  <Link href="/resources/upload">
                    <Button size="sm">
                      <Upload className="w-4 h-4" /> Upload Resource
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources, topics, subjects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(activeFilterCount > 0 && "border-primary text-primary")}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Type pills ── */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setType(""); setPage(1); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                !type
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> All Types {!type && meta.total > 0 && `(${meta.total})`}
            </button>
            {RESOURCE_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => { setType(type === rt.value ? "" : rt.value); setPage(1); }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                  type === rt.value
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                <rt.icon className="w-3.5 h-3.5" /> {rt.label}
              </button>
            ))}
          </div>

          {/* ── Expanded filters panel ── */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> Advanced Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Access type */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Access Type</label>
                  <select
                    value={accessType}
                    onChange={(e) => { setAccessType(e.target.value); setPage(1); }}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ACCESS_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                {/* Curriculum */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Curriculum</label>
                  <select
                    value={curriculumId}
                    onChange={(e) => { setCurriculumId(e.target.value); setSubjectId(""); setPage(1); }}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Curricula</option>
                    {curricula.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {/* Education level */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Education Level</label>
                  <select
                    value={levelId}
                    onChange={(e) => { setLevelId(e.target.value); setPage(1); }}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Levels</option>
                    {educationLevels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                {/* Subject */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => { setSubjectId(e.target.value); setPage(1); }}
                    disabled={!curriculumId}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Toolbar: count + sort ── */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${meta.total.toLocaleString()} resource${meta.total !== 1 ? "s" : ""} found`}
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Resource grid ── */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <ResourceSkeleton key={i} />)}
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="w-14 h-14 text-muted-foreground/20 mb-4" />
              <h3 className="font-semibold text-foreground text-lg">No resources found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {search ? `No results for "${search}". Try adjusting your filters.` : "Be the first to upload a resource in this category."}
              </p>
              <div className="flex gap-2 mt-4">
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4" /> Clear Filters
                  </Button>
                )}
                {canUpload && (
                  <Link href="/resources/upload">
                    <Button size="sm"><Upload className="w-4 h-4" /> Upload Resource</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                        page === p
                          ? "bg-primary text-white shadow-sm"
                          : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >{p}</button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
