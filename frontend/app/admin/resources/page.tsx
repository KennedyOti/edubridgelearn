"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, XCircle, EyeOff, Eye, Search, Filter,
  Download, Star, Loader2, AlertCircle, ChevronLeft, ChevronRight,
  BookOpen, Clock, FileText, MessageSquare, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminResource {
  id: string;
  title: string;
  type: string;
  type_label: string;
  access_type: string;
  price_formatted: string;
  status: string;
  rejection_reason: string | null;
  downloads_count: number;
  purchases_count: number;
  avg_rating: number;
  file_size_label: string;
  file_url: string | null;
  preview_url: string | null;
  created_at: string;
  published_at: string | null;
  creator: { id: string; name: string; avatar_url: string | null; role: string };
  subject: { id: number; name: string } | null;
  education_level: { id: number; name: string } | null;
}

interface Meta { total: number; current_page: number; last_page: number }

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:          { label: "Draft",          color: "bg-muted text-muted-foreground",  icon: FileText },
  pending_review: { label: "Pending Review", color: "bg-warning/10 text-warning",       icon: Clock },
  published:      { label: "Published",      color: "bg-success/10 text-success",        icon: CheckCircle },
  rejected:       { label: "Rejected",       color: "bg-error/10 text-error",            icon: XCircle },
  unlisted:       { label: "Unlisted",       color: "bg-muted text-muted-foreground",   icon: EyeOff },
};

// ── Resource row ──────────────────────────────────────────────────────────────

function AdminResourceRow({
  resource,
  onApprove,
  onReject,
  onUnlist,
  actionBusy,
}: {
  resource: AdminResource;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUnlist: (id: string) => void;
  actionBusy: string | null;
}) {
  const cfg       = STATUS_CONFIG[resource.status] ?? STATUS_CONFIG.draft;
  const CfgIcon   = cfg.icon;
  const busy      = actionBusy === resource.id;
  const isPending   = resource.status === "pending_review";
  const isPublished = resource.status === "published";

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center">
          {resource.preview_url
            ? <img src={resource.preview_url} alt="" className="w-full h-full object-cover" />
            : <BookOpen className="w-6 h-6 text-muted-foreground/40" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Status + type badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", cfg.color)}>
              <CfgIcon className="w-3 h-3" /> {cfg.label}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {resource.type_label}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {resource.access_type === "free" ? "Free" : resource.price_formatted}
            </span>
          </div>

          {/* Title */}
          <Link href={`/resources/${resource.id}`} target="_blank">
            <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 leading-snug">
              {resource.title}
            </h3>
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-muted inline-flex items-center justify-center text-[7px] font-bold">
                {resource.creator.name.charAt(0)}
              </span>
              {resource.creator.name}
              <span className="text-muted-foreground/50">({resource.creator.role})</span>
            </span>
            {resource.subject && <span>{resource.subject.name}</span>}
            {resource.education_level && <span>{resource.education_level.name}</span>}
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(resource.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {resource.downloads_count}</span>
          {resource.avg_rating > 0 && (
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-secondary text-secondary" /> {resource.avg_rating.toFixed(1)}</span>
          )}
          <span className="text-muted-foreground/60">{resource.file_size_label}</span>
        </div>
      </div>

      {/* Rejection reason */}
      {resource.rejection_reason && (
        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <span className="font-medium">Rejection reason:</span> {resource.rejection_reason}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 justify-end flex-wrap pt-1 border-t border-border">
        <Link href={`/resources/${resource.id}`} target="_blank">
          <Button size="sm" variant="outline" className="h-8">
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
        </Link>
        {resource.file_url && (
          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-8">
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </a>
        )}

        {isPending && (
          <>
            <Button
              size="sm"
              className="h-8 bg-success hover:bg-success/90 text-white"
              onClick={() => onApprove(resource.id)}
              disabled={busy}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-error text-error hover:bg-error/10"
              onClick={() => onReject(resource.id)}
              disabled={busy}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </>
        )}

        {isPublished && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-muted-foreground hover:bg-muted"
            onClick={() => onUnlist(resource.id)}
            disabled={busy}
          >
            <EyeOff className="w-3.5 h-3.5" /> Unlist
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({
  onConfirm,
  onCancel,
  busy,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h2 className="font-bold text-foreground text-lg">Reject Resource</h2>
        <p className="text-sm text-muted-foreground">
          Provide feedback so the creator can improve their submission.
        </p>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Rejection Reason <span className="text-error">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Content quality is insufficient, duplicate resource, file is corrupted, missing taxonomy..."
            className="w-full text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-error/30 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">{reason.length}/1000</p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            className="bg-error hover:bg-error/90 text-white"
            disabled={!reason.trim() || busy}
            onClick={() => onConfirm(reason)}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Confirm Rejection
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminResourcesPage() {
  const router  = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [resources,  setResources]  = useState<AdminResource[]>([]);
  const [meta,       setMeta]       = useState<Meta>({ total: 0, current_page: 1, last_page: 1 });
  const [isLoading,  setIsLoading]  = useState(true);
  const [status,     setStatus]     = useState("pending_review");
  const [type,       setType]       = useState("");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [rejectId,   setRejectId]   = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) { router.push("/admin/login"); return; }
    if (user && !["admin", "super_admin"].includes(user.role)) router.push("/dashboard");
  }, [isAuthenticated, user, router]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 20, page };
      if (status) params.status = status;
      if (type)   params.type   = type;
      if (search) params.search = search;
      const { data } = await api.get("/admin/resources", { params });
      setResources(data.data);
      setMeta(data.meta);
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, type, search, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (id: string) => {
    setActionBusy(id);
    try {
      await api.post(`/admin/resources/${id}/approve`);
      showToast("success", "Resource approved and published.");
      fetchResources();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { message: string }[] } } })
        .response?.data?.errors?.[0]?.message ?? "Approval failed.";
      showToast("error", msg);
    } finally {
      setActionBusy(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectId) return;
    setActionBusy(rejectId);
    try {
      await api.post(`/admin/resources/${rejectId}/reject`, { reason });
      setRejectId(null);
      showToast("success", "Resource rejected.");
      fetchResources();
    } catch {
      showToast("error", "Rejection failed. Please try again.");
    } finally {
      setActionBusy(null);
    }
  };

  const handleUnlist = async (id: string) => {
    if (!confirm("Unlist this resource? It will be hidden from the marketplace.")) return;
    setActionBusy(id);
    try {
      await api.post(`/admin/resources/${id}/unlist`);
      showToast("success", "Resource unlisted.");
      fetchResources();
    } catch {
      showToast("error", "Unlist failed.");
    } finally {
      setActionBusy(null);
    }
  };

  const pendingCount = status === "pending_review" ? meta.total : 0;

  return (
    <AdminDashboardLayout title="Resource Moderation" activeTab="resources">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={cn(
            "fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm animate-fade-up",
            toast.type === "success"
              ? "bg-success/10 text-success border-success/20"
              : "bg-error/10 text-error border-error/20"
          )}>
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.text}
          </div>
        )}

        {/* Reject modal */}
        {rejectId && (
          <RejectModal
            onConfirm={handleReject}
            onCancel={() => setRejectId(null)}
            busy={actionBusy === rejectId}
          />
        )}

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            Resource Moderation
            {status === "pending_review" && meta.total > 0 && (
              <span className="bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {meta.total}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, approve, or reject resources submitted by tutors and contributors.
          </p>
        </div>

        {/* Pending alert banner */}
        {status === "pending_review" && !isLoading && meta.total > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">{meta.total} resource{meta.total !== 1 ? "s" : ""}</span> awaiting review. Approve or reject each submission below.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="w-4 h-4 text-primary" /> Filters
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="text-sm border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Types</option>
              <option value="notes">Notes & Study Guides</option>
              <option value="practice_questions">Practice Questions</option>
              <option value="assignment">Assignments</option>
              <option value="past_paper">Past Exam Papers</option>
              <option value="flashcard_deck">Flashcard Decks</option>
              <option value="simulation">Simulations</option>
              <option value="worksheet">Worksheets</option>
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-sm border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "pending_review", label: "Pending Review" },
            { value: "published",      label: "Published" },
            { value: "rejected",       label: "Rejected" },
            { value: "unlisted",       label: "Unlisted" },
            { value: "",               label: "All" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                status === s.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${meta.total.toLocaleString()} resource${meta.total !== 1 ? "s" : ""}`}
        </p>

        {/* Resource list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border">
            <MessageSquare className="w-14 h-14 text-muted-foreground/20 mb-4" />
            <h3 className="font-semibold text-foreground">No resources found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "pending_review"
                ? "No resources are currently awaiting review. Check back later."
                : "No resources match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((r) => (
              <AdminResourceRow
                key={r.id}
                resource={r}
                onApprove={handleApprove}
                onReject={(id) => setRejectId(id)}
                onUnlist={handleUnlist}
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
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
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
    </AdminDashboardLayout>
  );
}
