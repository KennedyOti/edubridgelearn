"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Upload, BookOpen, Download, Star, Edit2, Trash2, Send,
  CheckCircle, Clock, XCircle, EyeOff, Eye, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, TrendingUp, DollarSign, FileText, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  title: string;
  type: string;
  type_label: string;
  access_type: "free" | "purchase" | "subscription";
  price_formatted: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "unlisted";
  rejection_reason: string | null;
  downloads_count: number;
  purchases_count: number;
  avg_rating: number;
  file_size_label: string;
  subject: { id: number; name: string } | null;
  education_level: { id: number; name: string } | null;
  created_at: string;
  published_at: string | null;
}

interface Meta { total: number; current_page: number; last_page: number }

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:          { label: "Draft",          color: "bg-muted text-muted-foreground",    icon: FileText },
  pending_review: { label: "Under Review",   color: "bg-warning/10 text-warning",         icon: Clock },
  published:      { label: "Published",      color: "bg-success/10 text-success",          icon: CheckCircle },
  rejected:       { label: "Rejected",       color: "bg-error/10 text-error",              icon: XCircle },
  unlisted:       { label: "Unlisted",       color: "bg-muted text-muted-foreground",     icon: EyeOff },
};

const STATUSES = ["", "draft", "pending_review", "published", "rejected", "unlisted"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Resource row ──────────────────────────────────────────────────────────────

function ResourceRow({
  resource,
  onSubmit,
  onDelete,
  actionBusy,
}: {
  resource: Resource;
  onSubmit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  actionBusy: string | null;
}) {
  const cfg      = STATUS_CONFIG[resource.status] ?? STATUS_CONFIG.draft;
  const CfgIcon  = cfg.icon;
  const canEdit  = ["draft", "rejected"].includes(resource.status);
  const canSubmit= canEdit;
  const busy     = actionBusy === resource.id;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", cfg.color)}>
              <CfgIcon className="w-3 h-3" /> {cfg.label}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{resource.type_label}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{resource.access_type === "free" ? "Free" : resource.price_formatted}</span>
          </div>
          <Link href={`/resources/${resource.id}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors text-sm leading-snug line-clamp-2">
              {resource.title}
            </h3>
          </Link>
          {(resource.subject || resource.education_level) && (
            <p className="text-xs text-muted-foreground mt-1">
              {[resource.education_level?.name, resource.subject?.name].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/resources/${resource.id}`}>
            <Button size="sm" variant="outline" className="h-8 px-2.5" title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/resources/upload?edit=${resource.id}`}>
              <Button size="sm" variant="outline" className="h-8 px-2.5" title="Edit">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          {canSubmit && (
            <Button
              size="sm"
              className="h-8 px-3"
              onClick={() => onSubmit(resource.id)}
              disabled={busy}
              title="Submit for review"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline ml-1">Submit</span>
            </Button>
          )}
          <button
            onClick={() => onDelete(resource.id, resource.title)}
            disabled={busy}
            className="h-8 px-2.5 rounded-lg border border-border text-muted-foreground hover:text-error hover:border-error transition-colors flex items-center"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rejection reason */}
      {resource.rejection_reason && (
        <div className="flex items-start gap-2 text-xs text-error bg-error/5 px-3 py-2 rounded-lg border border-error/20">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span><strong>Rejection reason:</strong> {resource.rejection_reason}</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {resource.downloads_count} downloads</span>
        {resource.purchases_count > 0 && (
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {resource.purchases_count} purchases</span>
        )}
        {resource.avg_rating > 0 && (
          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-secondary text-secondary" /> {resource.avg_rating.toFixed(1)}</span>
        )}
        <span className="ml-auto">{formatDate(resource.created_at)}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyResourcesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <MyResourcesInner />
    </Suspense>
  );
}

function MyResourcesInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const [resources, setResources] = useState<Resource[]>([]);
  const [meta,      setMeta]      = useState<Meta>({ total: 0, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [status,    setStatus]    = useState("");
  const [page,      setPage]      = useState(1);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [toast, setToast]         = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stats summary
  const totalDownloads = resources.reduce((s, r) => s + r.downloads_count, 0);
  const totalPurchases = resources.reduce((s, r) => s + r.purchases_count, 0);
  const avgRating      = resources.filter((r) => r.avg_rating > 0);
  const overallRating  = avgRating.length > 0 ? (avgRating.reduce((s, r) => s + r.avg_rating, 0) / avgRating.length).toFixed(1) : "—";
  const uploadedId     = searchParams.get("uploaded");

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
    else if (user && !["tutor", "contributor", "admin", "super_admin"].includes(user.role)) router.push("/resources");
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (uploadedId) {
      setToast({ type: "success", text: "Resource uploaded successfully! Submit it for review when ready." });
      setTimeout(() => setToast(null), 5000);
    }
  }, [uploadedId]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 10, page };
      if (status) params.status = status;
      const { data } = await api.get("/resources/my-uploads", { params });
      setResources(data.data);
      setMeta(data.meta);
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSubmit = async (id: string) => {
    setActionBusy(id);
    try {
      await api.post(`/resources/${id}/submit`);
      setToast({ type: "success", text: "Resource submitted for review." });
      fetchResources();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { message: string }[] } } })
        .response?.data?.errors?.[0]?.message ?? "Submission failed.";
      setToast({ type: "error", text: msg });
    } finally {
      setActionBusy(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionBusy(id);
    try {
      await api.delete(`/resources/${id}`);
      setToast({ type: "success", text: "Resource deleted." });
      fetchResources();
    } catch {
      setToast({ type: "error", text: "Delete failed." });
    } finally {
      setActionBusy(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Toast */}
          {toast && (
            <div className={cn(
              "fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm animate-fade-up",
              toast.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
            )}>
              {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {toast.text}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">My Resources</h1>
                <p className="text-sm text-muted-foreground">Manage your uploaded study materials</p>
              </div>
            </div>
            <Link href="/resources/upload">
              <Button size="sm">
                <Upload className="w-4 h-4" /> Upload New Resource
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={<FileText className="w-5 h-5" />} label="Total Resources" value={String(meta.total)} color="text-primary" />
            <StatCard icon={<Download className="w-5 h-5" />} label="Total Downloads" value={String(totalDownloads)} color="text-accent" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Purchases" value={String(totalPurchases)} color="text-secondary-dark" />
            <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Avg. Rating" value={String(overallRating)} color="text-highlight" />
          </div>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const cfg = s ? STATUS_CONFIG[s] : null;
              return (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                    status === s
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {s === "" ? "All" : cfg?.label ?? s}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border">
              <BookOpen className="w-14 h-14 text-muted-foreground/20 mb-4" />
              <h3 className="font-semibold text-foreground">No resources yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {status ? `No resources with status "${STATUS_CONFIG[status]?.label}".` : "Upload your first study resource to share with students."}
              </p>
              {!status && (
                <Link href="/resources/upload" className="mt-4">
                  <Button size="sm"><Upload className="w-4 h-4" /> Upload Resource</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((r) => (
                <ResourceRow
                  key={r.id}
                  resource={r}
                  onSubmit={handleSubmit}
                  onDelete={handleDelete}
                  actionBusy={actionBusy}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 space-y-2">
      <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", color)}>{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
