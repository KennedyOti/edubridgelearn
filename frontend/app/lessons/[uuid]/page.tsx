"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Modal } from "@/components/ui/modal";
import api from "@/lib/api";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings,
  ChevronLeft, Lock, Star, Users, BookOpen, Clock,
  CheckCircle2, MessageSquare, Loader2, AlertCircle,
  ChevronDown, ChevronUp, List,
} from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: number;
  title: string;
  start_second: number;
  end_second: number | null;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  video_url_720p: string | null;
  video_url_1080p: string | null;
  video_url_360p: string | null;
  duration_seconds: number | null;
  access_type: "free" | "subscription" | "paid";
  price: number | null;
  currency: string | null;
  avg_rating: number;
  total_reviews: number;
  total_views: number;
  subject: { id: number; name: string } | null;
  topic: { id: number; name: string } | null;
  chapters: Chapter[];
  tutor: {
    id: string;
    name: string;
    avatar_url: string | null;
    profile: {
      avg_rating: number;
      total_sessions: number;
    };
  };
  user_progress: {
    watched_seconds: number;
    last_position_seconds: number;
    is_completed: boolean;
  } | null;
  has_access: boolean;
  reviews: LessonReview[];
}

interface LessonReview {
  id: string;
  rating: number;
  comment: string | null;
  student_name: string;
  created_at: string;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LessonPlayerPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "reviews">("overview");

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState<"360p" | "720p" | "1080p">("720p");
  const [showControls, setShowControls] = useState(true);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Review modal
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Progress tracking
  const lastReportedSecond = useRef(0);

  useEffect(() => {
    api.get(`/lessons/${uuid}`)
      .then(({ data }) => {
        setLesson(data.data);
        if (data.data.user_progress?.last_position_seconds) {
          setCurrentTime(data.data.user_progress.last_position_seconds);
        }
      })
      .catch(() => setLesson(null))
      .finally(() => setIsLoading(false));
  }, [uuid]);

  const reportProgress = useCallback(async (seconds: number) => {
    if (Math.abs(seconds - lastReportedSecond.current) < 10) return;
    lastReportedSecond.current = seconds;
    try {
      await api.post(`/students/lessons/${uuid}/progress`, {
        last_position_seconds: Math.floor(seconds),
        watched_seconds: Math.floor(seconds),
      });
    } catch {
      // Silently ignore
    }
  }, [uuid]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    reportProgress(t);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setVolume(v);
    setIsMuted(v === 0);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const showControlsTemp = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const seekToChapter = (startSecond: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startSecond;
      setCurrentTime(startSecond);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const getVideoUrl = () => {
    if (!lesson) return "";
    return (
      (quality === "1080p" && lesson.video_url_1080p) ||
      (quality === "720p" && lesson.video_url_720p) ||
      lesson.video_url_360p ||
      lesson.video_url_720p ||
      ""
    );
  };

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true);
    try {
      await api.post(`/students/lessons/${uuid}/review`, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setLesson((prev) => prev ? {
        ...prev,
        reviews: [{
          id: Date.now().toString(),
          rating: reviewRating,
          comment: reviewComment,
          student_name: "You",
          created_at: new Date().toISOString(),
        }, ...prev.reviews],
      } : prev);
      setReviewModal(false);
    } catch {
      // silently ignore
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <BookOpen className="w-12 h-12 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">Lesson not found</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = lesson.duration_seconds
    ? Math.round(((lesson.user_progress?.watched_seconds ?? 0) / lesson.duration_seconds) * 100)
    : 0;

  const tutorInitials = lesson.tutor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout title={lesson.title}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/lessons" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to lessons
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left — player + info */}
          <div className="xl:col-span-2 space-y-5">

            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
              {lesson.has_access ? (
                <div
                  className="relative aspect-video group"
                  onMouseMove={showControlsTemp}
                  onClick={togglePlay}
                >
                  <video
                    ref={videoRef}
                    src={getVideoUrl()}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                        if (lesson.user_progress?.last_position_seconds) {
                          videoRef.current.currentTime = lesson.user_progress.last_position_seconds;
                        }
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Controls overlay */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
                      showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 space-y-2">
                      {/* Progress bar */}
                      <div className="relative group/seek">
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary accent-primary"
                          style={{
                            background: `linear-gradient(to right, hsl(var(--primary)) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%)`,
                          }}
                        />
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="text-white hover:text-primary transition-colors"
                        >
                          {isPlaying
                            ? <Pause className="w-6 h-6" />
                            : <Play className="w-6 h-6" />}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 accent-white"
                          />
                        </div>

                        <span className="text-white/80 text-xs font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        <div className="ml-auto flex items-center gap-2">
                          {/* Quality */}
                          <div className="relative">
                            <button
                              onClick={() => setQualityMenuOpen((o) => !o)}
                              className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              {quality}
                            </button>
                            {qualityMenuOpen && (
                              <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg overflow-hidden min-w-[80px]">
                                {(["360p", "720p", "1080p"] as const).map((q) => (
                                  <button
                                    key={q}
                                    onClick={() => { setQuality(q); setQualityMenuOpen(false); }}
                                    className={`block w-full text-left px-3 py-2 text-xs transition-colors ${quality === q ? "text-primary bg-white/10" : "text-white/80 hover:bg-white/10"}`}
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={handleFullscreen} className="text-white/80 hover:text-white transition-colors">
                            <Maximize className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play button center (when paused) */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-10 h-10 text-white ml-2" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No access — locked state */
                <div className="aspect-video flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white/60" />
                  </div>
                  <div className="text-center text-white px-6">
                    <p className="font-semibold text-lg">This lesson is locked</p>
                    <p className="text-white/60 text-sm mt-1">
                      {lesson.access_type === "paid"
                        ? `Purchase for ${lesson.currency ?? "$"}${((lesson.price ?? 0) / 100).toFixed(2)} to watch`
                        : "Upgrade your subscription to access this lesson"}
                    </p>
                  </div>
                  <Button>
                    {lesson.access_type === "paid"
                      ? `Buy — ${lesson.currency ?? "$"}${((lesson.price ?? 0) / 100).toFixed(2)}`
                      : "Upgrade to Premium"}
                  </Button>
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold text-foreground leading-snug">{lesson.title}</h1>
                {lesson.user_progress?.is_completed && (
                  <div className="flex items-center gap-1.5 text-green-600 shrink-0 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Completed
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {lesson.subject && <Badge variant="secondary" className="text-xs">{lesson.subject.name}</Badge>}
                {lesson.topic && <Badge variant="outline" className="text-xs">{lesson.topic.name}</Badge>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {lesson.total_views.toLocaleString()} views
                </div>
                {lesson.duration_seconds && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(lesson.duration_seconds)}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {lesson.has_access && lesson.duration_seconds && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Your progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
              {(["overview", "chapters", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {tab === "chapters" && lesson.chapters.length > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({lesson.chapters.length})</span>
                  )}
                  {tab === "reviews" && lesson.total_reviews > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({lesson.total_reviews})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && lesson.description && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  About this lesson
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Chapters tab */}
            {activeTab === "chapters" && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <List className="w-4 h-4 text-primary" />
                  Chapters
                </h3>
                {lesson.chapters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No chapters available for this lesson.</p>
                ) : (
                  <div className="space-y-1">
                    {lesson.chapters.map((chapter, idx) => {
                      const isActive = currentTime >= chapter.start_second &&
                        (chapter.end_second === null || currentTime < chapter.end_second);
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => lesson.has_access && seekToChapter(chapter.start_second)}
                          disabled={!lesson.has_access}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                            isActive
                              ? "bg-primary-50 text-primary"
                              : lesson.has_access
                              ? "hover:bg-muted text-foreground"
                              : "text-muted-foreground cursor-default"
                          }`}
                        >
                          <span className={`text-xs font-mono w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-sm">{chapter.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0 font-mono">
                            {formatTime(chapter.start_second)}
                          </span>
                          {isActive && <Play className="w-3 h-3 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-foreground">
                      {lesson.avg_rating.toFixed(1)}
                    </div>
                    <div>
                      <Rating value={lesson.avg_rating} size="sm" showValue={false} />
                      <p className="text-xs text-muted-foreground mt-0.5">{lesson.total_reviews} reviews</p>
                    </div>
                  </div>
                  {lesson.has_access && lesson.user_progress?.is_completed && (
                    <Button size="sm" variant="outline" onClick={() => setReviewModal(true)}>
                      <Star className="w-3.5 h-3.5" />
                      Write Review
                    </Button>
                  )}
                </div>

                {lesson.reviews.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lesson.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {review.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{review.student_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Rating value={review.rating} size="sm" showValue={false} className="mt-0.5" />
                          {review.comment && (
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="space-y-4">
            {/* Tutor card */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Instructor</h3>
              <div className="flex items-center gap-3 mb-4">
                {lesson.tutor.avatar_url ? (
                  <img src={lesson.tutor.avatar_url} alt={lesson.tutor.name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                    {tutorInitials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{lesson.tutor.name}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {lesson.tutor.profile.avg_rating.toFixed(1)}
                    <span className="text-muted-foreground">({lesson.tutor.profile.total_sessions} sessions)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/tutors/${lesson.tutor.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
                >
                  View Profile
                </Link>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/book/${lesson.tutor.id}`)}
                >
                  Book Session
                </Button>
              </div>
            </div>

            {/* Lesson info */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Lesson Info</h3>
              <div className="space-y-2.5 text-sm">
                {lesson.subject && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium text-foreground">{lesson.subject.name}</span>
                  </div>
                )}
                {lesson.topic && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topic</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{lesson.topic.name}</span>
                  </div>
                )}
                {lesson.duration_seconds && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{formatTime(lesson.duration_seconds)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chapters</span>
                  <span className="font-medium text-foreground">{lesson.chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access</span>
                  <Badge
                    variant={lesson.access_type === "free" ? "success" : lesson.access_type === "subscription" ? "info" : "default"}
                    className="text-xs capitalize"
                  >
                    {lesson.access_type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="Review this Lesson" size="sm">
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">How would you rate this lesson?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Comment <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share what you learned or how this lesson helped you…"
              rows={4}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <Button onClick={handleSubmitReview} isLoading={isSubmittingReview} className="w-full">
            Submit Review
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
