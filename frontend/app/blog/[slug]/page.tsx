"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  Send,
  MessageSquare,
  ChevronRight,
  BookOpen,
  AlertCircle,
  PenTool,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Comment {
  id: number;
  body: string;
  is_approved: boolean;
  created_at: string;
  author: { id: string; name: string; avatar_url: string | null };
  replies?: Comment[];
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featured_image_url: string | null;
  status: string;
  reading_time_minutes: number;
  views_count: number;
  is_featured: boolean;
  published_at: string;
  seo_metadata: { title?: string; description?: string } | null;
  author: { id: string; name: string; avatar_url: string | null; role: string };
  category: { id: number; name: string; slug: string; color_hex: string } | null;
  tags: { id: number; name: string; slug: string }[];
  comments: Comment[];
  comments_count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Avatar({ name, url, size = 8 }: { name: string; url: string | null; size?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Comment component ─────────────────────────────────────────────────────────

function CommentItem({
  comment,
  onReply,
  slug,
}: {
  comment: Comment;
  onReply: (parentId: number, text: string) => Promise<void>;
  slug: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} url={comment.author.avatar_url} size={8} />
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.body}</p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-muted-foreground hover:text-primary mt-1 ml-2 font-medium transition-colors"
          >
            Reply
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <Button type="submit" size="sm" isLoading={isSubmitting} className="self-end">
              <Send className="w-3 h-3" />
            </Button>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-border ml-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar name={reply.author.name} url={reply.author.avatar_url} size={6} />
                <div className="bg-muted/50 rounded-2xl rounded-tl-none px-3 py-2 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{reply.author.name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/blogs/${slug}`);
      setPost(data.data);
      setComments(data.data.comments ?? []);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post(`/blogs/${slug}/comment`, { body: commentText });
      setCommentText("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
      // Refresh comments
      fetchPost();
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: number, text: string) => {
    await api.post(`/blogs/${slug}/comment`, { body: text, parent_id: parentId });
    fetchPost();
  };

  const isOwner = user && post && user.id === post.author.id;
  const isAdmin = user && ["admin", "super_admin"].includes(user.role);

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-8 bg-muted rounded w-4/5" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 pt-16">
          <BookOpen className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground">Article not found</h2>
          <p className="text-muted-foreground mt-1 text-sm">This post may have been removed or does not exist.</p>
          <Link href="/blog" className="mt-6">
            <Button size="sm"><ArrowLeft className="w-4 h-4" /> Back to Blog</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-white sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-2 text-sm">
          <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          {post.category && (
            <>
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {post.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            </>
          )}
          <span className="text-foreground font-medium truncate">{post.title}</span>

          {(isOwner || isAdmin) && (
            <div className="ml-auto flex gap-2">
              <Link href={`/blog/${post.slug}/edit`}>
                <Button size="sm" variant="outline">
                  <PenTool className="w-3.5 h-3.5" /> Edit
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Category + tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.category && (
            <Link href={`/blog?category=${post.category.slug}`}>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: post.category.color_hex }}
              >
                {post.category.name}
              </span>
            </Link>
          )}
          {post.tags.map((tag) => (
            <span key={tag.id} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/30 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Author + meta */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-border mb-8">
          <div className="flex items-center gap-3">
            <Avatar name={post.author.name} url={post.author.avatar_url} size={10} />
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{post.author.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time_minutes} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views_count.toLocaleString()} views</span>
          </div>
        </div>

        {/* Featured image */}
        {post.featured_image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img src={post.featured_image_url} alt={post.title} className="w-full object-cover max-h-[420px]" />
          </div>
        )}

        {/* Body */}
        <div
          className="prose prose-sm sm:prose max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-blockquote:border-primary/50
            prose-blockquote:text-muted-foreground prose-code:bg-muted
            prose-code:rounded prose-code:px-1 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Tags footer */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <span className="text-xs bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                    #{tag.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Comments section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="border-t border-border pt-10">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments ({comments.length})
          </h2>

          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-3">
                <Avatar name={user!.name} url={user!.avatar_url} size={9} />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                  <div className="flex items-center justify-between">
                    {commentSuccess && (
                      <p className="text-xs text-success flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                        Comment submitted for moderation.
                      </p>
                    )}
                    <div className="ml-auto">
                      <Button
                        type="submit"
                        size="sm"
                        isLoading={isSubmittingComment}
                        disabled={!commentText.trim()}
                      >
                        <Send className="w-4 h-4" /> Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border">
              <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>{" "}
                to join the discussion.
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReply={handleReply} slug={slug} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
      <Footer />
    </>
  );
}
