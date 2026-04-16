"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Download, ShoppingCart, Star, BookOpen, FileText,
  GraduationCap, Layers, Cpu, ClipboardList, FlaskConical, CheckCircle,
  Calendar, User, HardDrive, Hash, AlertCircle, Eye, Loader2,
  MessageSquare, Send, Lock, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  student: { id: string; name: string; avatar_url: string | null } | null;
}

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
  status: string;
  rejection_reason: string | null;
  avg_rating: number;
  downloads_count: number;
  purchases_count: number;
  reviews_count: number;
  file_size_label: string;
  file_mime_type: string | null;
  preview_url: string | null;
  file_url: string | null;
  exam_year: number | null;
  examining_body: string | null;
  version: number;
  is_purchased: boolean;
  download_count: number;
  published_at: string;
  created_at: string;
  creator: { id: string; name: string; avatar_url: string | null; role: string };
  curriculum: { id: number; name: string; code: string | null } | null;
  education_level: { id: number; name: string } | null;
  subject: { id: number; name: string } | null;
  topic: { id: number; name: string } | null;
  subtopic: { id: number; name: string } | null;
  tags: { id: number; name: string; slug: string }[];
  reviews: Review[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ElementType> = {
  notes:              BookOpen,
  practice_questions: ClipboardList,
  assignment:         FileText,
  past_paper:         GraduationCap,
  flashcard_deck:     Layers,
  simulation:         Cpu,
  worksheet:          FlaskConical,
};

function typeColor(type: string) {
  const map: Record<string, string> = {
    notes:              "from-primary/20 to-primary/5 text-primary",
    practice_questions: "from-accent/20 to-accent/5 text-accent",
    assignment:         "from-secondary/20 to-secondary/5 text-secondary-dark",
    past_paper:         "from-highlight/20 to-highlight/5 text-highlight",
    flashcard_deck:     "from-info/20 to-info/5 text-info",
    simulation:         "from-success/20 to-success/5 text-success",
    worksheet:          "from-warning/20 to-warning/5 text-warning",
  };
  return map[type] ?? "from-muted to-muted/50 text-muted-foreground";
}

function StarRating({ rating, interactive = false, onRate }: {
  rating: number; interactive?: boolean; onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-5 h-5 transition-colors",
            s <= (interactive ? (hover || rating) : Math.round(rating))
              ? "fill-secondary text-secondary"
              : "text-muted-foreground/30",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
        />
      ))}
    </div>
  );
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourceDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid }  = use(params);
  const router    = useRouter();
  const { user }  = useAuthStore();

  const [resource,   setResource]   = useState<Resource | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg,  setActionMsg]  = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDesc,   setShowDesc]   = useState(false);

  // Review form
  const [myRating,     setMyRating]     = useState(0);
  const [reviewText,   setReviewText]   = useState("");
  const [reviewBusy,   setReviewBusy]   = useState(false);
  const [reviewMsg,    setReviewMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    api.get(`/resources/${uuid}`)
      .then(({ data }) => setResource(data.data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setIsLoading(false));
  }, [uuid]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-muted/30 pt-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !resource) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-muted/30 pt-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h2 className="font-semibold text-foreground">Resource not found</h2>
            <Link href="/resources"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /> Back to Marketplace</Button></Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isFree      = resource.access_type === "free";
  const isPurchased = resource.is_purchased;
  const isCreator   = user?.id === resource.creator.id; // uuid comparison
  const isAdmin     = user && ["admin", "super_admin"].includes(user.role);
  const canDownload = isFree || isPurchased || isCreator || isAdmin;
  const canReview   = user?.role === "student" && (isFree || isPurchased);
  const TypeIcon    = TYPE_ICONS[resource.type] ?? BookOpen;

  // Pre-fill existing review if any
  const existingReview = resource.reviews.find(
    (r) => r.student?.id === user?.id
  );

  const handlePurchase = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setActionBusy(true);
    setActionMsg(null);
    try {
      await api.post(`/resources/${uuid}/purchase`);
      setActionMsg({ type: "success", text: "Purchase successful! You can now download this resource." });
      // Refresh
      const { data } = await api.get(`/resources/${uuid}`);
      setResource(data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { message: string }[] } } })
        .response?.data?.errors?.[0]?.message ?? "Purchase failed. Please try again.";
      setActionMsg({ type: "error", text: msg });
    } finally {
      setActionBusy(false);
    }
  };

  const handleDownload = async () => {
    setActionBusy(true);
    setActionMsg(null);
    try {
      const { data } = await api.post(`/resources/${uuid}/download`);
      const url  = data.data.download_url;
      const name = data.data.file_name;
      const a    = document.createElement("a");
      a.href     = url;
      a.download = name;
      a.target   = "_blank";
      a.rel      = "noopener noreferrer";
      a.click();
      setActionMsg({ type: "success", text: "Download started." });
      // Update download count
      setResource((r) => r ? { ...r, downloads_count: r.downloads_count + 1, download_count: r.download_count + 1 } : r);
    } catch {
      setActionMsg({ type: "error", text: "Download failed. Please try again." });
    } finally {
      setActionBusy(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myRating === 0) return;
    setReviewBusy(true);
    setReviewMsg(null);
    try {
      await api.post(`/resources/${uuid}/review`, { rating: myRating, review_text: reviewText || null });
      setReviewMsg({ type: "success", text: "Review submitted!" });
      setShowReviewForm(false);
      const { data } = await api.get(`/resources/${uuid}`);
      setResource(data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { message: string }[] } } })
        .response?.data?.errors?.[0]?.message ?? "Could not submit review.";
      setReviewMsg({ type: "error", text: msg });
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Back */}
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: main content ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Hero */}
              <div className={cn("rounded-3xl bg-gradient-to-br p-8 flex items-start gap-6", typeColor(resource.type))}>
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center shrink-0">
                  <TypeIcon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{resource.type_label}</span>
                    {resource.version > 1 && (
                      <span className="text-[10px] bg-white/30 px-2 py-0.5 rounded-full font-medium">v{resource.version}</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold leading-tight mb-2">{resource.title}</h1>
                  {resource.exam_year && (
                    <p className="text-sm opacity-80">
                      {resource.examining_body && `${resource.examining_body} · `}{resource.exam_year}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {resource.description && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-sm text-foreground mb-3">About this Resource</h2>
                  <div className={cn("text-sm text-muted-foreground leading-relaxed", !showDesc && "line-clamp-4")}>
                    {resource.description}
                  </div>
                  {resource.description.length > 300 && (
                    <button
                      onClick={() => setShowDesc((v) => !v)}
                      className="text-xs text-primary font-medium mt-2 flex items-center gap-1 hover:underline"
                    >
                      {showDesc ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
                    </button>
                  )}
                </div>
              )}

              {/* Preview */}
              {resource.preview_url && (
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" /> Preview
                    </h2>
                    {!canDownload && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Full version requires access
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <img
                      src={resource.preview_url}
                      alt="Resource preview"
                      className="w-full object-cover max-h-[480px]"
                    />
                    {!canDownload && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-border">
                          <Lock className="w-3 h-3" /> Preview only · Get access to download the full resource
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Taxonomy */}
              {(resource.curriculum || resource.education_level || resource.subject || resource.topic) && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-sm text-foreground mb-4">Classification</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {resource.curriculum && (
                      <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Curriculum" value={resource.curriculum.name} />
                    )}
                    {resource.education_level && (
                      <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Level" value={resource.education_level.name} />
                    )}
                    {resource.subject && (
                      <InfoRow icon={<FileText className="w-4 h-4" />} label="Subject" value={resource.subject.name} />
                    )}
                    {resource.topic && (
                      <InfoRow icon={<Hash className="w-4 h-4" />} label="Topic" value={resource.topic.name} />
                    )}
                    {resource.subtopic && (
                      <InfoRow icon={<Hash className="w-4 h-4" />} label="Subtopic" value={resource.subtopic.name} />
                    )}
                    {resource.exam_year && (
                      <InfoRow icon={<Calendar className="w-4 h-4" />} label="Exam Year" value={String(resource.exam_year)} />
                    )}
                    {resource.examining_body && (
                      <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Examining Body" value={resource.examining_body} />
                    )}
                  </div>
                  {resource.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {resource.tags.map((t) => (
                        <span key={t.id} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">#{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Reviews {resource.reviews_count > 0 && `(${resource.reviews_count})`}
                  </h2>
                  {canReview && !showReviewForm && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(true);
                        if (existingReview) { setMyRating(existingReview.rating); setReviewText(existingReview.review_text ?? ""); }
                      }}
                    >
                      {existingReview ? "Edit Review" : "Write a Review"}
                    </Button>
                  )}
                </div>

                {/* Rating summary */}
                {resource.avg_rating > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">{resource.avg_rating.toFixed(1)}</div>
                      <StarRating rating={resource.avg_rating} />
                      <div className="text-xs text-muted-foreground mt-1">{resource.reviews_count} review{resource.reviews_count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                )}

                {/* Review form */}
                {showReviewForm && (
                  <form onSubmit={handleReview} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Rating</label>
                      <StarRating rating={myRating} interactive onRate={setMyRating} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Review (optional)</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience with this resource..."
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>
                    {reviewMsg && (
                      <p className={cn("text-xs", reviewMsg.type === "success" ? "text-success" : "text-error")}>{reviewMsg.text}</p>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={myRating === 0 || reviewBusy}>
                        {reviewBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit Review
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                    </div>
                  </form>
                )}

                {/* Review list */}
                {resource.reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first to review this resource.</p>
                ) : (
                  <div className="space-y-4">
                    {resource.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {review.student?.name.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{review.student?.name ?? "Student"}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(review.created_at)}</span>
                          </div>
                          <StarRating rating={review.rating} />
                          {review.review_text && <p className="text-sm text-muted-foreground mt-1.5">{review.review_text}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: sidebar ── */}
            <div className="space-y-4">

              {/* Purchase / download card */}
              <div className="bg-white rounded-2xl border border-border p-6 sticky top-20 space-y-4">
                {/* Price */}
                <div>
                  {isFree ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-success">Free</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">{resource.price_formatted}</span>
                      {resource.access_type === "subscription" && (
                        <span className="text-sm text-muted-foreground">/ subscription</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action message */}
                {actionMsg && (
                  <div className={cn(
                    "text-sm px-3 py-2.5 rounded-lg flex items-start gap-2",
                    actionMsg.type === "success" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  )}>
                    {actionMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    {actionMsg.text}
                  </div>
                )}

                {/* Action button */}
                {canDownload ? (
                  <Button className="w-full" onClick={handleDownload} disabled={actionBusy}>
                    {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Resource
                  </Button>
                ) : resource.access_type === "purchase" ? (
                  <Button className="w-full" onClick={handlePurchase} disabled={actionBusy}>
                    {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                    Purchase — {resource.price_formatted}
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    <Lock className="w-4 h-4" /> Requires Subscription
                  </Button>
                )}

                {isPurchased && (
                  <p className="text-xs text-success flex items-center gap-1.5 justify-center">
                    <CheckCircle className="w-3.5 h-3.5" /> Purchased · Downloaded {resource.download_count} time{resource.download_count !== 1 ? "s" : ""}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                  <StatBadge icon={<Download className="w-3.5 h-3.5" />} value={resource.downloads_count} label="Downloads" />
                  <StatBadge icon={<Star className="w-3.5 h-3.5" />} value={resource.avg_rating > 0 ? resource.avg_rating.toFixed(1) : "—"} label="Rating" />
                  <StatBadge icon={<HardDrive className="w-3.5 h-3.5" />} value={resource.file_size_label} label="Size" />
                </div>
              </div>

              {/* Creator card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Creator</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {resource.creator.avatar_url
                      ? <img src={resource.creator.avatar_url} alt={resource.creator.name} className="w-full h-full rounded-full object-cover" />
                      : resource.creator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{resource.creator.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.creator.role}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</h3>
                <DetailRow label="Type"     value={resource.type_label} />
                <DetailRow label="Format"   value={resource.file_mime_type?.split("/")[1]?.toUpperCase() ?? "—"} />
                <DetailRow label="Size"     value={resource.file_size_label} />
                <DetailRow label="Version"  value={`v${resource.version}`} />
                {resource.published_at && (
                  <DetailRow label="Published" value={new Date(resource.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
                )}
                {resource.examining_body && <DetailRow label="Exam Board" value={resource.examining_body} />}
                {resource.exam_year && <DetailRow label="Year" value={String(resource.exam_year)} />}
              </div>

              {/* Review status for student */}
              {reviewMsg && (
                <div className={cn("text-sm px-3 py-2.5 rounded-xl", reviewMsg.type === "success" ? "bg-success/10 text-success" : "bg-error/10 text-error")}>
                  {reviewMsg.text}
                </div>
              )}

              {/* Creator management link */}
              {(isCreator || isAdmin) && (
                <Link href="/resources/my-resources">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4" /> Manage My Resources
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="text-center space-y-1">
      <div className="flex justify-center text-muted-foreground">{icon}</div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
