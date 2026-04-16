"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Upload, X, FileText, CheckCircle, AlertCircle,
  Loader2, BookOpen, ClipboardList, GraduationCap, Layers, Cpu,
  FlaskConical, Plus, Tag, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilterOption { id: number; name: string; code?: string }

const RESOURCE_TYPES = [
  { value: "notes",              label: "Notes & Study Guide",    icon: BookOpen,      ext: "PDF, DOCX" },
  { value: "practice_questions", label: "Practice Questions",     icon: ClipboardList, ext: "PDF, DOCX, JSON" },
  { value: "assignment",         label: "Assignment / Worksheet", icon: FileText,      ext: "PDF, DOCX" },
  { value: "past_paper",         label: "Past Exam Paper",        icon: GraduationCap, ext: "PDF" },
  { value: "flashcard_deck",     label: "Flashcard Deck",         icon: Layers,        ext: "JSON, PDF" },
  { value: "simulation",         label: "Interactive Simulation", icon: Cpu,           ext: "HTML5, ZIP" },
  { value: "worksheet",          label: "Worksheet",              icon: FlaskConical,  ext: "PDF, DOCX" },
];

const ACCESS_TYPES = [
  { value: "free",         label: "Free",                    desc: "Anyone can download this resource for free." },
  { value: "purchase",     label: "One-time Purchase",       desc: "Students pay once to download permanently." },
  { value: "subscription", label: "Subscription",            desc: "Available to subscribers of the platform." },
];

const MAX_FILE_MB  = 50;
const MAX_PREV_MB  = 5;
const CURRENT_YEAR = new Date().getFullYear();

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({
  file, accept, maxMb, label, hint, onFile, onClear,
}: {
  file: File | null; accept: string; maxMb: number; label: string; hint: string;
  onFile: (f: File) => void; onClear: () => void;
}) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.size <= maxMb * 1_048_576) onFile(f);
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={onClear} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"
          )}
        >
          <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Drop file here or <span className="text-primary underline">browse</span></p>
          <p className="text-xs text-muted-foreground mt-1">{hint} · Max {maxMb} MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UploadResourcePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [mainFile,    setMainFile]    = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Form state
  const [title,          setTitle]          = useState("");
  const [description,    setDescription]    = useState("");
  const [resourceType,   setResourceType]   = useState("");
  const [accessType,     setAccessType]     = useState("free");
  const [price,          setPrice]          = useState("");
  const [currency,       setCurrency]       = useState("USD");
  const [examYear,       setExamYear]       = useState("");
  const [examiningBody,  setExaminingBody]  = useState("");
  const [tagInput,       setTagInput]       = useState("");
  const [tags,           setTags]           = useState<string[]>([]);

  // Taxonomy
  const [curricula,       setCurricula]       = useState<FilterOption[]>([]);
  const [educationLevels, setEducationLevels] = useState<FilterOption[]>([]);
  const [subjects,        setSubjects]        = useState<FilterOption[]>([]);
  const [topics,          setTopics]          = useState<FilterOption[]>([]);
  const [curriculumId,    setCurriculumId]    = useState("");
  const [levelId,         setLevelId]         = useState("");
  const [subjectId,       setSubjectId]       = useState("");
  const [topicId,         setTopicId]         = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [step,         setStep]         = useState<1 | 2 | 3>(1); // 1=type, 2=details, 3=pricing

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (user && !["tutor", "contributor", "admin", "super_admin"].includes(user.role)) {
      router.push("/resources");
    }
  }, [isAuthenticated, user, router]);

  // Fetch taxonomy
  useEffect(() => {
    api.get("/curricula").then(({ data }) => setCurricula(data.data ?? [])).catch(() => {});
    api.get("/curriculum/options").then(({ data }) => {
      if (data.data?.education_levels) setEducationLevels(data.data.education_levels);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (curriculumId) {
      api.get(`/curriculum/levels/${curriculumId}/subjects`).then(({ data }) => {
        setSubjects(data.data ?? []);
      }).catch(() => setSubjects([]));
    } else { setSubjects([]); setSubjectId(""); setTopics([]); setTopicId(""); }
  }, [curriculumId]);

  useEffect(() => {
    if (subjectId) {
      api.get(`/curriculum/subjects/${subjectId}/topics`).then(({ data }) => {
        setTopics(data.data ?? []);
      }).catch(() => setTopics([]));
    } else { setTopics([]); setTopicId(""); }
  }, [subjectId]);

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainFile || !resourceType || !title.trim()) {
      setError("Please fill in all required fields and upload a file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("title",       title.trim());
      fd.append("description", description.trim());
      fd.append("type",        resourceType);
      fd.append("file",        mainFile);
      fd.append("access_type", accessType);
      fd.append("currency",    currency);
      if (previewFile) fd.append("preview_file", previewFile);
      if (accessType === "purchase" && price) fd.append("price", String(Math.round(parseFloat(price) * 100)));
      if (curriculumId)   fd.append("curriculum_id", curriculumId);
      if (levelId)        fd.append("education_level_id", levelId);
      if (subjectId)      fd.append("subject_id", subjectId);
      if (topicId)        fd.append("topic_id", topicId);
      if (examYear)       fd.append("exam_year", examYear);
      if (examiningBody)  fd.append("examining_body", examiningBody.trim());
      tags.forEach((t, i) => fd.append(`tags[${i}]`, t));

      const { data } = await api.post("/resources", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push(`/resources/my-resources?uploaded=${data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { message: string }[]; message?: string } } })
        .response?.data?.errors?.[0]?.message
        ?? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ?? "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = RESOURCE_TYPES.find((t) => t.value === resourceType);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/resources/my-resources" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Upload Resource</h1>
              <p className="text-sm text-muted-foreground">Share your study materials with students worldwide</p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step > s ? "bg-success text-white" : step === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", step >= s ? "text-foreground" : "text-muted-foreground")}>
                  {s === 1 ? "Resource Type" : s === 2 ? "Details & Files" : "Pricing"}
                </span>
                {i < 2 && <div className={cn("flex-1 h-0.5 rounded", step > s ? "bg-success" : "bg-border")} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Step 1: Resource Type ── */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                <h2 className="font-semibold text-foreground">What type of resource are you uploading?</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {RESOURCE_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => setResourceType(rt.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                        resourceType === rt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        resourceType === rt.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <rt.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{rt.label}</p>
                        <p className="text-xs text-muted-foreground">{rt.ext}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => { if (resourceType) setStep(2); }} disabled={!resourceType}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2: Details & Files ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Resource Details</h2>
                    {selectedType && (
                      <span className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 px-2.5 py-1 rounded-full">
                        <selectedType.icon className="w-3.5 h-3.5" /> {selectedType.label}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Title <span className="text-error">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Form 3 Chemistry Notes — Organic Chemistry"
                      className="w-full text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      maxLength={255}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe what this resource covers, who it's for, and what students will gain..."
                      className="w-full text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      maxLength={5000}
                    />
                  </div>

                  {/* Files */}
                  <DropZone
                    file={mainFile}
                    accept=".pdf,.docx,.doc,.json,.html,.zip"
                    maxMb={MAX_FILE_MB}
                    label={`Resource File *`}
                    hint="PDF, DOCX, JSON, HTML, ZIP"
                    onFile={setMainFile}
                    onClear={() => setMainFile(null)}
                  />
                  <DropZone
                    file={previewFile}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxMb={MAX_PREV_MB}
                    label="Preview / Thumbnail (optional)"
                    hint="First page screenshot, cover image — PDF, JPG, PNG"
                    onFile={setPreviewFile}
                    onClear={() => setPreviewFile(null)}
                  />
                </div>

                {/* Taxonomy */}
                <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="font-semibold text-foreground">Classification</h2>
                  <p className="text-xs text-muted-foreground -mt-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Helps students find your resource through filters and recommendations.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectField label="Curriculum" value={curriculumId} onChange={(v) => { setCurriculumId(v); setSubjectId(""); setTopicId(""); }}>
                      <option value="">— Select Curriculum —</option>
                      {curricula.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </SelectField>
                    <SelectField label="Education Level" value={levelId} onChange={setLevelId}>
                      <option value="">— Select Level —</option>
                      {educationLevels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </SelectField>
                    <SelectField label="Subject" value={subjectId} onChange={(v) => { setSubjectId(v); setTopicId(""); }} disabled={!curriculumId}>
                      <option value="">— Select Subject —</option>
                      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </SelectField>
                    <SelectField label="Topic" value={topicId} onChange={setTopicId} disabled={!subjectId}>
                      <option value="">— Select Topic —</option>
                      {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </SelectField>

                    {/* Exam paper specific */}
                    {(resourceType === "past_paper" || resourceType === "practice_questions") && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Exam Year</label>
                          <input
                            type="number"
                            value={examYear}
                            onChange={(e) => setExamYear(e.target.value)}
                            placeholder={`e.g. ${CURRENT_YEAR - 1}`}
                            min={1990}
                            max={CURRENT_YEAR + 1}
                            className="w-full text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Examining Body</label>
                          <input
                            type="text"
                            value={examiningBody}
                            onChange={(e) => setExaminingBody(e.target.value)}
                            placeholder="e.g. KNEC, Cambridge, IEB"
                            className="w-full text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            maxLength={100}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5 block">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Tags (up to 10)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          #{t}
                          <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        maxLength={50}
                        disabled={tags.length >= 10}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={addTag} disabled={!tagInput.trim() || tags.length >= 10}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="button" onClick={() => { if (mainFile && title.trim()) setStep(3); else setError("Please provide a title and upload your file."); }} disabled={!mainFile || !title.trim()}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Pricing ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="font-semibold text-foreground">Pricing & Access</h2>

                  <div className="grid gap-3">
                    {ACCESS_TYPES.map((at) => (
                      <button
                        key={at.value}
                        type="button"
                        onClick={() => setAccessType(at.value)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                          accessType === at.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                          accessType === at.value ? "border-primary" : "border-muted-foreground/40"
                        )}>
                          {accessType === at.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{at.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{at.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {accessType === "purchase" && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Price <span className="text-error">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency}</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-12 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="text-sm border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option>USD</option>
                          <option>KES</option>
                          <option>GBP</option>
                          <option>EUR</option>
                          <option>NGN</option>
                          <option>ZAR</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
                  <h2 className="font-semibold text-foreground text-sm">Summary</h2>
                  <SummaryRow label="Title"   value={title} />
                  <SummaryRow label="Type"    value={selectedType?.label ?? "—"} />
                  <SummaryRow label="File"    value={mainFile?.name ?? "—"} />
                  <SummaryRow label="Access"  value={accessType === "purchase" ? `Paid — ${currency} ${price || "0.00"}` : accessType === "subscription" ? "Subscription" : "Free"} />
                  {subjectId && <SummaryRow label="Subject" value={subjects.find((s) => String(s.id) === subjectId)?.name ?? "—"} />}
                  {tags.length > 0 && <SummaryRow label="Tags" value={tags.map((t) => `#${t}`).join(", ")} />}
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-error bg-error/10 px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload Resource</>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your resource will be saved as a draft. Submit it for admin review when ready.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, disabled, children }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full text-sm border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right break-all">{value}</span>
    </div>
  );
}
