"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "pending_review" | "published" | "unpublished" | "rejected";
  rejection_reason: string | null;
  reading_time_minutes: number;
  views_count: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  deleted_at: string | null;
  author: { id: string; name: string; avatar_url: string | null; role: string };
  category: { id: number; name: string; slug: string } | null;
}

interface Meta { total: number; current_page: number; last_page: number; }

// ── Status badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<BlogPost["status"], { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending_review: { label: "Pending Review", className: "bg-warning/10 text-warning" },
  published: { label: "Published", className: "bg-success/10 text-success" },
  unpublished: { label: "Unpublished", className: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", className: "bg-error/10 text-error" },
};

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({
  postTitle,
  onConfirm,
  onCancel,
  isLoading,
}: {
  postTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-foreground">Reject Post</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">"{postTitle}"</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Rejection Reason <span className="text-error">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this post is being rejected and what the author needs to fix..."
            rows={4}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isLoading}
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            <XCircle className="w-4 h-4" /> Reject Post
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Post row ──────────────────────────────────────────────────────────────────

function PostRow({
  post,
  onApprove,
  onReject,
  onFeature,
}: {
  post: BlogPost;
  onApprove: (id: string) => void;
  onReject: (id: string, title: string) => void;
  onFeature: (id: string) => void;
}) {
  const [approving, setApproving] = useState(false);
  const [featuring, setFeaturing] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try { await onApprove(post.id); } finally { setApproving(false); }
  };

  const handleFeature = async () => {
    setFeaturing(true);
    try { await onFeature(post.id); } finally { setFeaturing(false); }
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-4 space-y-3",
      post.status === "pending_review" ? "border-warning/40 shadow-sm" : "border-border"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={post.status} />
            {post.category && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {post.category.name}
              </span>
            )}
            {post.is_featured && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            {post.deleted_at && (
              <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">Deleted</span>
            )}
          </div>

          <h3 className="font-semibold text-foreground text-sm">{post.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.excerpt}</p>

          {post.status === "rejected" && post.rejection_reason && (
            <div className="flex items-start gap-1.5 text-xs text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2 mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p><span className="font-semibold">Rejection:</span> {post.rejection_reason}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[8px] font-bold">
                {post.author.name.charAt(0)}
              </div>
              <span>{post.author.name}</span>
              <span className="capitalize text-muted-foreground/60">({post.author.role})</span>
            </div>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views_count}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_minutes}m</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {post.status === "published" && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button size="sm" variant="outline">
                <Eye className="w-3.5 h-3.5" /> View
              </Button>
            </Link>
          )}

          <button
            onClick={handleFeature}
            disabled={featuring || post.status !== "published"}
            className={cn(
              "p-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-40 disabled:pointer-events-none",
              post.is_featured
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
            title={post.is_featured ? "Remove from featured" : "Mark as featured"}
          >
            {featuring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
          </button>

          {post.status === "pending_review" && (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
                isLoading={approving}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onReject(post.id, post.title)}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending_review", label: "Pending Review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function AdminBlogPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const isAdmin = isAuthenticated && user && ["admin", "super_admin"].includes(user.role);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/admin/login"); return; }
    if (!isAdmin) router.push("/dashboard");
  }, [isAuthenticated, isAdmin, router]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 20, page };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get("/admin/blogs", { params });
      setPosts(data.data);
      setMeta(data.meta);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleApprove = async (uuid: string) => {
    await api.post(`/admin/blogs/${uuid}/approve`);
    fetchPosts();
  };

  const handleReject = (uuid: string, title: string) => {
    setRejectTarget({ id: uuid, title });
  };

  const confirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      await api.post(`/admin/blogs/${rejectTarget.id}/reject`, { reason });
      setRejectTarget(null);
      fetchPosts();
    } finally {
      setIsRejecting(false);
    }
  };

  const handleFeature = async (uuid: string) => {
    await api.post(`/admin/blogs/${uuid}/feature`);
    fetchPosts();
  };

  const pendingCount = posts.filter((p) => p.status === "pending_review").length;

  return (
    <AdminDashboardLayout activeTab="blog">
      <div className="p-4 sm:p-6 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Blog Moderation</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.total} posts total
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-warning font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} awaiting review
                </span>
              )}
            </p>
          </div>
          <Link href="/blog" target="_blank">
            <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> View Public Blog</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Published", value: posts.filter(p => p.status === "published").length, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
            { label: "Pending Review", value: posts.filter(p => p.status === "pending_review").length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
            { label: "Rejected", value: posts.filter(p => p.status === "rejected").length, icon: XCircle, color: "text-error", bg: "bg-error/10" },
            { label: "Drafts", value: posts.filter(p => p.status === "draft").length, icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  statusFilter === f.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {f.label}
                {f.value === "pending_review" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-warning text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posts list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 bg-muted rounded w-20" />
                  <div className="h-5 bg-muted rounded w-16" />
                </div>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
                <div className="h-4 bg-muted rounded w-1/2 mt-1" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-border">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground">No posts found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === "pending_review"
                ? "No posts are waiting for review."
                : "No posts match this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onApprove={handleApprove}
                onReject={handleReject}
                onFeature={handleFeature}
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

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          postTitle={rejectTarget.title}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
          isLoading={isRejecting}
        />
      )}
    </AdminDashboardLayout>
  );
}
