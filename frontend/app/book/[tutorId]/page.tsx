"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import {
  ChevronLeft, Calendar, Clock, BadgeCheck, MapPin,
  GraduationCap, Loader2, CheckCircle2, AlertCircle,
  ChevronLeft as ChevLeft, ChevronRight as ChevRight,
} from "lucide-react";
import Link from "next/link";

interface TutorSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  profile: {
    hourly_rate: number;
    rate_currency: string;
    avg_rating: number;
    total_sessions: number;
    experience_years: number | null;
    subjects: { id: number; name: string }[];
  };
}

interface TimeSlot {
  start: string; // "HH:MM"
  end: string;
  label: string;
}

const DURATIONS = [
  { value: "60", label: "60 min — 1 hour" },
  { value: "90", label: "90 min — 1.5 hours" },
  { value: "120", label: "120 min — 2 hours" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 7; h < 22; h++) {
    const start = `${h.toString().padStart(2, "0")}:00`;
    const endH = h + 1;
    const end = `${endH.toString().padStart(2, "0")}:00`;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    slots.push({ start, end, label: `${hour}:00 ${ampm}` });
  }
  return slots;
}

export default function BookSessionPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const router = useRouter();

  const [tutor, setTutor] = useState<TutorSummary | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState("60");
  const [subjectId, setSubjectId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    api.get(`/tutors/${tutorId}/profile`)
      .then(({ data }) => {
        setTutor(data.data);
        if (data.data.profile.subjects?.length === 1) {
          setSubjectId(String(data.data.profile.subjects[0].id));
        }
      })
      .catch(() => setTutor(null))
      .finally(() => setIsLoadingTutor(false));
  }, [tutorId]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const slots = generateSlots();

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  const isPastDate = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isSelectedDate = (day: number) =>
    selectedDate?.getFullYear() === calYear &&
    selectedDate?.getMonth() === calMonth &&
    selectedDate?.getDate() === day;

  const selectDate = (day: number) => {
    if (isPastDate(day)) return;
    setSelectedDate(new Date(calYear, calMonth, day));
    setSelectedSlot(null);
  };

  const estimatedCost = tutor
    ? ((tutor.profile.hourly_rate * Number(duration)) / 60).toFixed(2)
    : "0.00";

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time slot.");
      return;
    }
    setError("");
    setIsBooking(true);
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      const startsAt = `${dateStr}T${selectedSlot.start}:00`;

      const endMinutes = Number(selectedSlot.start.split(":")[0]) * 60 +
        Number(selectedSlot.start.split(":")[1]) + Number(duration);
      const endH = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      const endsAt = `${dateStr}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

      const payload: Record<string, string | number> = {
        tutor_id: tutorId,
        starts_at: startsAt,
        ends_at: endsAt,
        duration_minutes: Number(duration),
      };
      if (subjectId) payload.subject_id = Number(subjectId);
      if (note.trim()) payload.student_note = note.trim();

      const { data } = await api.post("/bookings", payload);
      setBookingRef(data.data.id ?? "");
      setBooked(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ?? "Failed to create booking. Please try again.";
      setError(msg);
    } finally {
      setIsBooking(false);
    }
  };

  if (booked) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Booking Requested!</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Your session request has been sent to {tutor?.name}. You&apos;ll receive a confirmation once they accept.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p>Booking reference</p>
              <p className="font-mono font-semibold text-foreground mt-1">{bookingRef.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/sessions")}>
                My Sessions
              </Button>
              <Button className="flex-1" onClick={() => router.push("/tutors")}>
                Find More Tutors
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingTutor) {
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
          <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-foreground font-semibold">Tutor not found</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const initials = tutor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout title="Book a Session">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <Link
          href={`/tutors/${tutorId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — booking form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Select a Date
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-foreground min-w-[130px] text-center">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPastDate(day);
                  const selected = isSelectedDate(day);
                  return (
                    <button
                      key={day}
                      onClick={() => selectDate(day)}
                      disabled={past}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-xl font-medium transition-all
                        ${selected
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : past
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : "hover:bg-primary-50 hover:text-primary text-foreground"}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Select a Time Slot
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    — {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        py-2 px-3 rounded-xl text-sm font-medium border transition-all
                        ${selectedSlot?.start === slot.start
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary-50"}
                      `}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Session details */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-foreground">Session Details</h2>

              <Select
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={DURATIONS}
              />

              {tutor.profile.subjects.length > 0 && (
                <Select
                  label="Subject (optional)"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  placeholder="Select a subject"
                  options={tutor.profile.subjects.map((s) => ({ value: String(s.id), label: s.name }))}
                />
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Note to Tutor <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g. I need help with quadratic equations from Chapter 5..."
                  rows={3}
                  className="rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Right — summary */}
          <div className="space-y-4">

            {/* Tutor card */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Booking with</h3>
              <div className="flex items-center gap-3">
                {tutor.avatar_url ? (
                  <img src={tutor.avatar_url} alt={tutor.name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-foreground">{tutor.name}</p>
                    <BadgeCheck className="w-4 h-4 text-primary" />
                  </div>
                  {tutor.country && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {tutor.country}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                    <span>★ {tutor.profile.avg_rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({tutor.profile.total_sessions} sessions)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking summary */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Booking Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">
                    {selectedSlot ? selectedSlot.label : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium text-foreground">
                    {tutor.profile.rate_currency} {tutor.profile.hourly_rate}/hr
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Estimated Total</span>
                  <span className="text-primary">{tutor.profile.rate_currency} {estimatedCost}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBook}
              isLoading={isBooking}
              disabled={!selectedDate || !selectedSlot}
            >
              <Calendar className="w-4 h-4" />
              Confirm Booking
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You will only be charged after the tutor confirms
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
