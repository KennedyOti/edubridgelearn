"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import {
  Plus, Play, Eye, Edit2, Trash2, BookOpen, Clock,
  Users, Star, Loader2, AlertCircle, CheckCircle2,
  Upload, Video, Lock, Unlock, ChevronRight, MoreVertical,
} from "lucide-react";

interface TutorLesson {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  access_type: "free" | "subscription" | "paid";
  price: number | null;
  currency: string | null;
  status: "draft" | "pending_review" | "published" | "unpublished";
  transcoding_status: "pending" | "processing" | "completed" | "failed";
  avg_rating: number;
  total_reviews: number;
  total_views: number;
  subject: { id: number; name: string } | null;
  created_at: string;
  published_at: string | null;
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

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const },
  pending_review: { label: "Under Review", variant: "warning" as const },
  published: { label: "Published", variant: "success" as const },
  unpublished: { label: "Unpublished", variant: "secondary" as const },
};

const TRANSCODING_CONFIG = {
  pending: { label: "Awaiting", variant: "secondary" as const },
  processing: { label: "Processing", variant: "warning" as const },
  completed: { label: "Ready", variant: "success" as const },
  failed: { label: "Failed", variant: "error" as const },
};

export default function TutorLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<TutorLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; lesson: TutorLesson | null }>({ open: false, lesson: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [accessType, setAccessType] = useState<"free" | "subscription" | "paid">("free");
  const [price, setPrice] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchLessons();
  }, [activeTab]);

  useEffect(() => {
    api.get("/curriculum/subjects/cbc")
      .then(({ data }) => setSubjects(data.data ?? []))
      .catch(() => {});
  }, []);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== "all") params.status = activeTab;
      const { data } = await api.get("/tutors/lessons", { params });
      setLessons(data.data ?? []);
    } catch {
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setCreateError("Title is required."); return; }
    setIsCreating(true);
    setCreateError("");
    try {
      const payload: Record<string, string | number> = {
        title: title.trim(),
        access_type: accessType,
      };
      if (description.trim()) payload.description = description.trim();
      if (subjectId) payload.subject_id = Number(subjectId);
      if (accessType === "paid" && price) payload.price = Math.round(Number(price) * 100);

      const { data } = await api.post("/tutors/lessons", payload);
      setCreateModal(false);
      resetForm();
      router.push(`/tutor/lessons/${data.data.id}/edit`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ?? "Failed to create lesson.";
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.lesson) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tutors/lessons/${deleteModal.lesson.id}`);
      setLessons((prev) => prev.filter((l) => l.id !== deleteModal.lesson!.id));
      setDeleteModal({ open: false, lesson: null });
    } catch {
      // silently fail
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (lesson: TutorLesson) => {
    if (lesson.transcoding_status !== "completed") return;
    try {
      await api.post(`/tutors/lessons/${lesson.id}/publish`);
      setLessons((prev) =>
        prev.map((l) => l.id === lesson.id ? { ...l, status: "published" } : l)
      );
    } catch {
      // silently fail
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubjectId("");
    setAccessType("free");
    setPrice("");
    setCreateError("");
  };

  const filtered = lessons;

  return (
    <DashboardLayout title="My Lessons">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Lessons</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Create and manage your recorded lessons</p>
          </div>
          <Button onClick={() => { resetForm(); setCreateModal(true); }}>
            <Plus className="w-4 h-4" />
            New Lesson
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Lessons", value: lessons.length, icon: BookOpen },
            { label: "Published", value: lessons.filter((l) => l.status === "published").length, icon: CheckCircle2 },
            { label: "Total Views", value: lessons.reduce((s, l) => s + l.total_views, 0).toLocaleString(), icon: Eye },
            { label: "Avg Rating", value: lessons.length ? (lessons.reduce((s, l) => s + l.avg_rating, 0) / lessons.length).toFixed(1) : "—", icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {(["all", "published", "draft"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All Lessons" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Lessons list */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading your lessons…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <Video className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No lessons yet</p>
              <p className="text-muted-foreground text-sm mt-1">Create your first recorded lesson</p>
            </div>
            <Button onClick={() => { resetForm(); setCreateModal(true); }}>
              <Plus className="w-4 h-4" />
              Create Lesson
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                onEdit={() => router.push(`/tutor/lessons/${lesson.id}/edit`)}
                onDelete={() => setDeleteModal({ open: true, lesson })}
                onPublish={() => handlePublish(lesson)}
                onPreview={() => router.push(`/lessons/${lesson.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Lesson"
        size="md"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Title <span className="text-error">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Quadratic Equations"
              className="rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this lesson?"
              rows={3}
              className="rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <Select
            label="Subject (optional)"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="Select a subject"
            options={subjects.map((s) => ({ value: String(s.id), label: s.name }))}
          />

          <Select
            label="Access Type"
            value={accessType}
            onChange={(e) => setAccessType(e.target.value as "free" | "subscription" | "paid")}
            options={[
              { value: "free", label: "Free — Anyone can watch" },
              { value: "subscription", label: "Subscription — Subscribers only" },
              { value: "paid", label: "Paid — One-time purchase" },
            ]}
          />

          {accessType === "paid" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  min="0.99"
                  step="0.01"
                  className="w-full rounded-xl border border-border pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {createError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {createError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Create & Continue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, lesson: null })}
        title="Delete Lesson"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">This action cannot be undone</p>
              <p className="text-sm text-red-600 mt-0.5">
                "{deleteModal.lesson?.title}" will be permanently deleted including all student progress data.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModal({ open: false, lesson: null })}>
              Keep Lesson
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={isDeleting}>
              Delete Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  onEdit,
  onDelete,
  onPublish,
  onPreview,
}: {
  lesson: TutorLesson;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onPreview: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[lesson.status];
  const transcodingConfig = TRANSCODING_CONFIG[lesson.transcoding_status];

  const canPublish =
    lesson.status !== "published" &&
    lesson.transcoding_status === "completed";

  const AccessIcon = lesson.access_type === "free" ? Unlock : Lock;

  return (
    <div className="bg-white rounded-2xl border border-border p-4 hover:border-primary/20 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 shrink-0 overflow-hidden flex items-center justify-center">
          {lesson.thumbnail_url ? (
            <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover" />
          ) : (
            <Video className="w-8 h-8 text-primary/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{lesson.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={statusConfig.variant} className="text-[10px]">
                  {statusConfig.label}
                </Badge>
                {lesson.transcoding_status !== "completed" && (
                  <Badge variant={transcodingConfig.variant} className="text-[10px]">
                    Video: {transcodingConfig.label}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <AccessIcon className="w-3 h-3" />
                  {lesson.access_type === "paid"
                    ? `$${((lesson.price ?? 0) / 100).toFixed(2)}`
                    : lesson.access_type}
                </div>
                {lesson.subject && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                    {lesson.subject.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 relative">
              <button
                onClick={onPreview}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Preview"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div
                  className="absolute top-8 right-0 bg-white rounded-xl border border-border shadow-lg z-10 min-w-[140px] overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {canPublish && (
                    <button
                      onClick={() => { onPublish(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {lesson.total_views.toLocaleString()} views
            </div>
            {lesson.duration_seconds && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(lesson.duration_seconds)}
              </div>
            )}
            {lesson.total_reviews > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {lesson.avg_rating.toFixed(1)} ({lesson.total_reviews})
              </div>
            )}
            <span className="ml-auto">
              {new Date(lesson.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
