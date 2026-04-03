"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Send,
  Edit3,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
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
  updated_at: string;
  category: { id: number; name: string; slug: string; color_hex: string } | null;
  tags: { id: number; name: string }[];
}

interface Meta { total: number; current_page: number; last_page: number; }

// ── Status badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<BlogPost["status"], { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Draft", icon: FileText, className: "bg-muted text-muted-foreground" },
  pending_review: { label: "Under Review", icon: Clock, className: "bg-warning/10 text-warning" },
  published: { label: "Published", icon: CheckCircle, className: "bg-success/10 text-success" },
  unpublished: { label: "Unpublished", icon: XCircle, className: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-error/10 text-error" },
};

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", config.className)}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

// ── Post row ──────────────────────────────────────────────────────────────────

function PostRow({
  post,
  onDelete,
  onSubmit,
}: {
  post: BlogPost;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(post.id);
    } finally {
      setSubmitting(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <StatusBadge status={post.status} />
          {post.category && (
            <span
              className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: post.category.color_hex }}
            >
              {post.category.name}
            </span>
          )}
          {post.is_featured && (
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">⭐ Featured</span>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
          {post.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>

        {post.status === "rejected" && post.rejection_reason && (
          <div className="flex items-start gap-1.5 text-xs text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Rejection reason:</span> {post.rejection_reason}</p>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_minutes}m read</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views_count.toLocaleString()} views</span>
          <span>Updated {new Date(post.updated_at).toLocaleDateString()}</span>
          {post.published_at && <span>Published {new Date(post.published_at).toLocaleDateString()}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank">
            <Button size="sm" variant="outline">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
          </Link>
        )}

        <Link href={`/blog/new?edit=${post.id}`}>
          <Button size="sm" variant="outline">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
        </Link>

        {(post.status === "draft" || post.status === "rejected") && (
          <Button size="sm" onClick={handleSubmit} isLoading={submitting}>
            <Send className="w-3.5 h-3.5" /> Submit
          </Button>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-xl shadow-lg py-1 w-36">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "", label: "All Posts" },
  { value: "draft", label: "Drafts" },
  { value: "pending_review", label: "Under Review" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const canWrite = isAuthenticated && user &&
    ["contributor", "tutor", "admin", "super_admin"].includes(user.role);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!canWrite) router.push("/dashboard");
  }, [isAuthenticated, canWrite, router]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 10, page };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/blogs/my-posts", { params });
      const filteredPosts = search
        ? data.data.filter((p: BlogPost) => p.title.toLowerCase().includes(search.toLowerCase()))
        : data.data;
      setPosts(filteredPosts);
      setMeta(data.meta);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (uuid: string) => {
    await api.delete(`/blogs/${uuid}`);
    fetchPosts();
  };

  const handleSubmit = async (uuid: string) => {
    await api.post(`/blogs/${uuid}/submit`);
    fetchPosts();
  };

  const pendingCount = posts.filter((p) => p.status === "pending_review").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <DashboardLayout title="My Blog Posts">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Blog Posts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.total} total · {publishedCount} published · {draftCount} drafts · {pendingCount} under review
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog">
              <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> View Blog</Button>
            </Link>
            <Link href="/blog/new">
              <Button size="sm"><PenTool className="w-4 h-4" /> New Post</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
                <div className="h-5 bg-muted rounded w-3/4 mt-2" />
                <div className="h-4 bg-muted rounded mt-2" />
                <div className="h-4 bg-muted rounded w-2/3 mt-1" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground">
              {statusFilter ? `No ${statusFilter.replace("_", " ")} posts` : "No posts yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter ? "Try a different filter." : "Start writing your first blog post."}
            </p>
            {!statusFilter && (
              <Link href="/blog/new" className="mt-4">
                <Button size="sm"><PenTool className="w-4 h-4" /> Write Your First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} onDelete={handleDelete} onSubmit={handleSubmit} />
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
    </DashboardLayout>
  );
}
