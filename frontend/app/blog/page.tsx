"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  Search,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  PenTool,
  BookOpen,
  TrendingUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  color_hex: string;
  posts_count: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  status: string;
  reading_time_minutes: number;
  views_count: number;
  is_featured: boolean;
  published_at: string;
  author: { id: string; name: string; avatar_url: string | null; role: string };
  category: { id: number; name: string; slug: string; color_hex: string } | null;
  tags: { id: number; name: string; slug: string }[];
}

interface PaginationMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function CategoryBadge({ category }: { category: { name: string; color_hex: string } }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-white"
      style={{ backgroundColor: category.color_hex }}
    >
      {category.name}
    </span>
  );
}

// ── Featured post card ────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary text-white min-h-[320px] flex flex-col justify-end p-8 cursor-pointer">
        {post.featured_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            style={{ backgroundImage: `url(${post.featured_image_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-3 h-3" /> Featured
            </span>
            {post.category && <CategoryBadge category={post.category} />}
          </div>

          <h2 className="text-2xl font-bold leading-tight group-hover:underline">{post.title}</h2>
          <p className="text-white/80 text-sm line-clamp-2">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-white/70 text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[9px] font-bold">
                {post.author.name.charAt(0)}
              </div>
              <span>{post.author.name}</span>
            </div>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.reading_time_minutes} min</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views_count.toLocaleString()}</span>
            <span>{timeAgo(post.published_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 flex flex-col h-full cursor-pointer">
        {post.featured_image_url ? (
          <div className="h-44 overflow-hidden shrink-0">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex items-start justify-between gap-2">
            {post.category ? (
              <CategoryBadge category={post.category} />
            ) : (
              <span />
            )}
          </div>

          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{post.excerpt}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {post.reading_time_minutes}m</span>
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {post.views_count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl w-full px-6">
          {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      </div>
    }>
      <BlogPageInner />
    </Suspense>
  );
}

function BlogPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, current_page: 1, last_page: 1, per_page: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const canWrite = user && ["contributor", "tutor", "admin", "super_admin"].includes(user.role);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/blogs/categories");
      setCategories(data.data);
    } catch {
      // silent
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 12, page };
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;

      const { data } = await api.get("/blogs", { params });
      setPosts(data.data);
      setMeta(data.meta);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, activeCategory, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug === activeCategory ? "" : slug);
    setPage(1);
  };

  const featuredPosts = posts.filter((p) => p.is_featured);
  const regularPosts = posts.filter((p) => !p.is_featured);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">EduBridge Blog</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Learn. Grow. Succeed.</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Expert insights, study tips, and educational resources from our community.
              </p>
            </div>

            {canWrite && (
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/blog/my-posts">
                  <Button variant="outline" size="sm">My Posts</Button>
                </Link>
                <Link href="/blog/new">
                  <Button size="sm">
                    <PenTool className="w-4 h-4" /> Write a Post
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveCategory(""); setPage(1); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              !activeCategory
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
            )}
          >
            All Posts {meta.total > 0 && `(${meta.total})`}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                activeCategory === cat.slug
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
              )}
              style={activeCategory === cat.slug ? { backgroundColor: cat.color_hex, borderColor: cat.color_hex } : {}}
            >
              {cat.name} {cat.posts_count > 0 && `(${cat.posts_count})`}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featuredPosts.length > 0 && page === 1 && !search && !activeCategory && (
          <div className="grid lg:grid-cols-2 gap-4">
            {featuredPosts.slice(0, 2).map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : regularPosts.length === 0 && featuredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground">No posts found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? `No results for "${search}".` : "Be the first to write a post in this category."}
            </p>
            {canWrite && (
              <Link href="/blog/new" className="mt-4">
                <Button size="sm"><PenTool className="w-4 h-4" /> Write the First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
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
                  >
                    {p}
                  </button>
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
