"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import api from "@/lib/api";
import {
  MapPin, Clock, BadgeCheck, ChevronLeft, BookOpen, Users,
  GraduationCap, Star, Calendar, Video, Award, Globe,
  MessageSquare, Loader2, Play,
} from "lucide-react";
import Link from "next/link";

interface TutorSubject {
  id: number;
  name: string;
  education_level?: string;
}

interface TutorQualification {
  id: number;
  title: string;
  institution: string | null;
  year: number | null;
  is_verified: boolean;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TutorProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  profile: {
    bio: string | null;
    experience_years: number | null;
    hourly_rate: number;
    rate_currency: string;
    avg_rating: number;
    total_sessions: number;
    total_students: number;
    teaching_methodology: string | null;
    intro_video_url: string | null;
    subjects: TutorSubject[];
    qualifications: TutorQualification[];
    availability: AvailabilitySlot[];
    reviews: TutorReview[];
  };
}

interface TutorReview {
  id: string;
  rating: number;
  comment: string | null;
  student_name: string;
  created_at: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "availability">("about");

  useEffect(() => {
    api.get(`/tutors/${id}/profile`)
      .then(({ data }) => setTutor(data.data))
      .catch(() => setTutor(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tutor) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="font-semibold text-foreground">Tutor not found</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const initials = tutor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const availabilityByDay = tutor.profile.availability.reduce<Record<number, AvailabilitySlot[]>>(
    (acc, slot) => {
      if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
      acc[slot.day_of_week].push(slot);
      return acc;
    },
    {}
  );

  return (
    <DashboardLayout title="Tutor Profile">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <Link
          href="/tutors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to tutors
        </Link>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Gradient banner */}
          <div className="h-32 bg-gradient-to-r from-primary via-primary-light to-secondary relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-5">
              <div className="flex items-end gap-4">
                <div className="relative">
                  {tutor.avatar_url ? (
                    <img
                      src={tutor.avatar_url}
                      alt={tutor.name}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-3xl">
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  </div>
                  {tutor.country && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {tutor.country}
                    </div>
                  )}
                </div>
              </div>

              <Button size="lg" onClick={() => router.push(`/book/${tutor.id}`)}>
                <Calendar className="w-4 h-4" />
                Book a Session
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-foreground">{Number(tutor.profile.avg_rating).toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="font-bold text-foreground mb-1">{tutor.profile.total_sessions}</div>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="font-bold text-foreground mb-1">
                  {tutor.profile.experience_years ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground">Yrs Experience</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="font-bold text-foreground mb-1">
                  {tutor.profile.rate_currency} {tutor.profile.hourly_rate}
                </div>
                <p className="text-xs text-muted-foreground">Per Hour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
              {(["about", "reviews", "availability"] as const).map((tab) => (
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
                </button>
              ))}
            </div>

            {/* About tab */}
            {activeTab === "about" && (
              <div className="space-y-5">
                {/* Bio */}
                {tutor.profile.bio && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      About
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tutor.profile.bio}</p>
                  </div>
                )}

                {/* Teaching methodology */}
                {tutor.profile.teaching_methodology && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      Teaching Style
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tutor.profile.teaching_methodology}
                    </p>
                  </div>
                )}

                {/* Qualifications */}
                {tutor.profile.qualifications?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Qualifications
                    </h3>
                    <div className="space-y-3">
                      {tutor.profile.qualifications.map((q) => (
                        <div key={q.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                            <GraduationCap className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{q.title}</p>
                              {q.is_verified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                            </div>
                            {(q.institution || q.year) && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {q.institution}{q.institution && q.year ? " · " : ""}{q.year}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subjects */}
                {tutor.profile.subjects?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Subjects Taught
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tutor.profile.subjects.map((s) => (
                        <div key={s.id} className="flex flex-col items-start">
                          <Badge variant="default" className="text-xs">{s.name}</Badge>
                          {s.education_level && (
                            <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">{s.education_level}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl border border-border p-5 space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">
                      {Number(tutor.profile.avg_rating).toFixed(1)}
                    </div>
                    <Rating value={Number(tutor.profile.avg_rating)} size="sm" showValue={false} className="justify-center mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">{tutor.profile.total_sessions} sessions</p>
                  </div>
                </div>

                {tutor.profile.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {tutor.profile.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3">
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
                ) : (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Availability tab */}
            {activeTab === "availability" && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Weekly Availability
                </h3>
                <div className="space-y-2">
                  {DAYS.map((day, i) => {
                    const slots = availabilityByDay[i];
                    return (
                      <div key={day} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${slots ? "bg-primary-50" : "bg-muted/30"}`}>
                        <span className={`w-10 text-sm font-medium ${slots ? "text-primary" : "text-muted-foreground"}`}>
                          {day}
                        </span>
                        {slots ? (
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((s, idx) => (
                              <span key={idx} className="text-xs bg-white text-primary border border-primary/20 px-2.5 py-1 rounded-lg font-medium">
                                {formatTime(s.start_time)} – {formatTime(s.end_time)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not available</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="space-y-4">
            {/* Book CTA card */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-foreground">
                  {tutor.profile.rate_currency} {tutor.profile.hourly_rate}
                </div>
                <p className="text-sm text-muted-foreground">per hour</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/book/${tutor.id}`)}
              >
                <Calendar className="w-4 h-4" />
                Book a Session
              </Button>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                  Verified tutor
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  {tutor.profile.total_sessions} sessions completed
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  {tutor.profile.experience_years
                    ? `${tutor.profile.experience_years} years experience`
                    : "Experienced tutor"}
                </div>
              </div>
            </div>

            {/* Intro video */}
            {tutor.profile.intro_video_url && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <video
                    src={tutor.profile.intro_video_url}
                    className="w-full h-full object-cover"
                    poster=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Intro Video</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Watch {tutor.name.split(" ")[0]}&apos;s introduction</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
