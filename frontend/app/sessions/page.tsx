"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import {
  Calendar, Clock, Video, MessageSquare, Star, Users,
  BookOpen, AlertCircle, Loader2, ChevronRight, X,
  CheckCircle2, XCircle, HelpCircle, PlayCircle,
} from "lucide-react";

interface Booking {
  id: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | "disputed";
  meeting_url: string | null;
  price: number;
  currency?: string;
  student_note: string | null;
  rating: number | null;
  review_comment: string | null;
  subject: { id: number; name: string } | null;
  other_party: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  session_notes: {
    id: string;
    content: string;
    created_at: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "error" | "secondary" | "default"; icon: React.FC<{ className?: string }> }> = {
  pending: { label: "Pending", variant: "warning", icon: HelpCircle },
  confirmed: { label: "Confirmed", variant: "success", icon: CheckCircle2 },
  in_progress: { label: "In Progress", variant: "info", icon: PlayCircle },
  completed: { label: "Completed", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "error", icon: XCircle },
  no_show: { label: "No-show", variant: "error", icon: XCircle },
  disputed: { label: "Disputed", variant: "error", icon: AlertCircle },
};

const TABS = ["upcoming", "completed", "cancelled"] as const;
type Tab = (typeof TABS)[number];

export default function SessionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isTutor = user?.role === "tutor";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: string }>({ open: false, bookingId: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const endpoint = isTutor ? "/tutors/bookings" : "/students/bookings";

  useEffect(() => {
    setIsLoading(true);
    const statusMap: Record<Tab, string> = {
      upcoming: "upcoming",
      completed: "completed",
      cancelled: "cancelled",
    };
    api.get(endpoint, { params: { status: statusMap[activeTab], per_page: 20 } })
      .then(({ data }) => setBookings(data.data ?? []))
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, [activeTab, endpoint]);

  const handleCancel = async () => {
    if (!cancelModal.bookingId) return;
    setIsCancelling(true);
    try {
      await api.post(`/bookings/${cancelModal.bookingId}/cancel`, {
        reason: cancelReason.trim() || undefined,
      });
      setBookings((prev) => prev.filter((b) => b.id !== cancelModal.bookingId));
      setCancelModal({ open: false, bookingId: "" });
      setCancelReason("");
    } catch {
      // silently fail
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.booking) return;
    setIsSubmittingReview(true);
    try {
      await api.post(`/bookings/${reviewModal.booking.id}/review`, {
        rating,
        comment: reviewComment.trim() || undefined,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewModal.booking!.id
            ? { ...b, rating, review_comment: reviewComment }
            : b
        )
      );
      setReviewModal({ open: false, booking: null });
    } catch {
      // silently fail
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const tabCounts = {
    upcoming: bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => ["cancelled", "no_show", "disputed"].includes(b.status)).length,
  };

  return (
    <DashboardLayout title="My Sessions">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isTutor ? "Manage your teaching sessions" : "Track your learning sessions"}
            </p>
          </div>
          {!isTutor && (
            <Button onClick={() => router.push("/tutors")}>
              <BookOpen className="w-4 h-4" />
              Find a Tutor
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab !== tab && tabCounts[tab] > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No {activeTab} sessions</p>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === "upcoming" && !isTutor
                  ? "Book a session with a tutor to get started"
                  : `You have no ${activeTab} sessions`}
              </p>
            </div>
            {activeTab === "upcoming" && !isTutor && (
              <Button onClick={() => router.push("/tutors")}>Find a Tutor</Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isTutor={isTutor}
                onJoin={() => booking.meeting_url && window.open(booking.meeting_url, "_blank")}
                onCancel={() => setCancelModal({ open: true, bookingId: booking.id })}
                onReview={() => {
                  setReviewModal({ open: true, booking });
                  setRating(booking.rating ?? 5);
                  setReviewComment(booking.review_comment ?? "");
                }}
                onViewDetails={() => router.push(`/sessions/${booking.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        open={reviewModal.open}
        onClose={() => setReviewModal({ open: false, booking: null })}
        title="Leave a Review"
        size="sm"
      >
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              How was your session with{" "}
              <span className="font-semibold text-foreground">
                {reviewModal.booking?.other_party.name}
              </span>?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground mt-2">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Comment <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <Button onClick={handleSubmitReview} isLoading={isSubmittingReview} className="w-full">
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={cancelModal.open}
        onClose={() => setCancelModal({ open: false, bookingId: "" })}
        title="Cancel Session"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Are you sure you want to cancel this session? This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let the other party know why you're cancelling…"
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelModal({ open: false, bookingId: "" })}
            >
              Keep Session
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleCancel}
              isLoading={isCancelling}
            >
              Cancel Session
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  isTutor,
  onJoin,
  onCancel,
  onReview,
  onViewDetails,
}: {
  booking: Booking;
  isTutor: boolean;
  onJoin: () => void;
  onCancel: () => void;
  onReview: () => void;
  onViewDetails: () => void;
}) {
  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const start = new Date(booking.starts_at);
  const canJoin = booking.status === "confirmed" || booking.status === "in_progress";
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canReview = !isTutor && booking.status === "completed" && !booking.rating;

  const initials = booking.other_party.name
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-border hover:border-primary/20 hover:shadow-sm transition-all p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Other party */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {booking.other_party.avatar_url ? (
            <img
              src={booking.other_party.avatar_url}
              alt={booking.other_party.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground truncate">{booking.other_party.name}</p>
              <Badge variant={config.variant}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </Badge>
            </div>
            {booking.subject && (
              <p className="text-xs text-muted-foreground mt-0.5">{booking.subject.name}</p>
            )}
          </div>
        </div>

        {/* Date/time */}
        <div className="flex flex-col sm:items-end gap-1 text-sm">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {booking.duration_minutes} min
          </div>
        </div>
      </div>

      {/* Notes preview */}
      {booking.student_note && (
        <div className="mt-3 flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{booking.student_note}</p>
        </div>
      )}

      {/* Rating (if reviewed) */}
      {booking.rating && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${s <= booking.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
            />
          ))}
          {booking.review_comment && (
            <span className="text-muted-foreground ml-1 text-xs line-clamp-1">{booking.review_comment}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {canJoin && booking.meeting_url && (
          <Button size="sm" onClick={onJoin} className="gap-1.5">
            <Video className="w-3.5 h-3.5" />
            Join Session
          </Button>
        )}
        {canReview && (
          <Button size="sm" variant="outline" onClick={onReview} className="gap-1.5">
            <Star className="w-3.5 h-3.5" />
            Leave Review
          </Button>
        )}
        {isTutor && booking.status === "confirmed" && (
          <Button size="sm" variant="outline" onClick={onViewDetails} className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Add Notes
          </Button>
        )}
        <button
          onClick={onViewDetails}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {canCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
