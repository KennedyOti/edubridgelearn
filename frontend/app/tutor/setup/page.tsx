"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import {
  User,
  BookOpen,
  DollarSign,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";

const tutorSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters").max(2000),
  experience_years: z.number().min(0).max(60),
  hourly_rate: z.number().min(1, "Set an hourly rate greater than 0"),
  rate_currency: z.string(),
  teaching_methodology: z.string().min(20, "Describe your teaching approach (min 20 characters)").max(5000),
  intro_video_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type TutorForm = z.infer<typeof tutorSchema>;

// Fields belonging to each step — used for per-step validation
const stepFields: Record<number, (keyof TutorForm)[]> = {
  0: ["bio", "experience_years", "teaching_methodology", "intro_video_url"],
  1: [], // qualifications managed outside RHF
  2: ["hourly_rate", "rate_currency"],
  3: [], // review step
};

interface Qualification {
  title: string;
  institution: string;
  year: number;
}

const tutorSteps = [
  { title: "About You", icon: User, description: "Tell students about yourself" },
  { title: "Qualifications", icon: FileText, description: "Add your academic credentials" },
  { title: "Subjects & Rate", icon: DollarSign, description: "What you teach and your pricing" },
  { title: "Review & Submit", icon: Check, description: "Review and submit for approval" },
];

const allSubjects = [
  "Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics",
  "History", "Geography", "Computer Science", "Economics", "Business Studies",
  "Agriculture", "Psychology", "Sociology", "French", "Spanish",
];

export default function TutorSetupPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [newQual, setNewQual] = useState<Qualification>({ title: "", institution: "", year: new Date().getFullYear() });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [stepError, setStepError] = useState("");

  const {
    register,
    trigger,
    watch,
    formState: { errors },
    getValues,
  } = useForm<TutorForm>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      rate_currency: "USD",
      experience_years: 0,
      hourly_rate: 0,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/");
    }
  }, [user, router]);

  const addQualification = () => {
    if (newQual.title && newQual.institution) {
      setQualifications([...qualifications, { ...newQual }]);
      setNewQual({ title: "", institution: "", year: new Date().getFullYear() });
    }
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleContinue = async () => {
    setStepError("");
    const fields = stepFields[currentStep];

    if (fields && fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) {
        setStepError("Please fix the errors above before continuing.");
        return;
      }
    }

    // Step 2: require at least one subject
    if (currentStep === 2 && selectedSubjects.length === 0) {
      setStepError("Please select at least one subject.");
      return;
    }

    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitError("");

    // Validate all fields before final submit
    const valid = await trigger();
    if (!valid) {
      // Collect all error messages to show on review step
      const allErrors = Object.values(errors)
        .map((e) => e?.message)
        .filter(Boolean);
      setSubmitError(
        allErrors.length > 0
          ? allErrors.join(" • ")
          : "Some required fields are incomplete. Please go back and check each step."
      );
      return;
    }

    if (selectedSubjects.length === 0) {
      setSubmitError("Please go back and select at least one subject.");
      return;
    }

    const data = getValues();
    setIsLoading(true);
    try {
      await api.put("/tutors/profile", {
        ...data,
        qualifications,
        subjects: selectedSubjects,
        intro_video_url: data.intro_video_url || null,
      });

      await api.post("/tutors/submit-review");

      // Refresh user in store so dashboard reflects submitted state
      await fetchUser();

      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { message: string }[] } } };
      setSubmitError(error.response?.data?.errors?.[0]?.message || "Failed to submit profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const bio = watch("bio");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Set Up Your Tutor Profile</h1>
            <p className="text-sm text-muted-foreground">Complete your profile to start teaching on EduBridge</p>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20 mb-6">
            <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium">Approval Required</p>
              <p className="text-muted-foreground mt-0.5">
                Your profile will be reviewed by our team before you can start offering tutoring services.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {tutorSteps.map((step, index) => (
              <div key={step.title} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    index < currentStep
                      ? "bg-primary text-white"
                      : index === currentStep
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < tutorSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded ${index < currentStep ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {tutorSteps[currentStep].description}
          </h2>

          {/* Step 1: About */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Professional Bio <span className="text-error">*</span>
                </label>
                <textarea
                  {...register("bio")}
                  rows={5}
                  placeholder="Tell students about your teaching background, expertise, and what makes you a great tutor..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && <p className="text-xs text-error">{errors.bio.message}</p>}
                  <span className="text-xs text-muted-foreground ml-auto">{bio?.length || 0}/2000</span>
                </div>
              </div>

              <Input
                {...register("experience_years", { valueAsNumber: true })}
                id="experience_years"
                type="number"
                label="Years of Teaching Experience"
                placeholder="e.g., 5"
                icon={<Clock className="w-4 h-4" />}
                error={errors.experience_years?.message}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Teaching Methodology <span className="text-error">*</span>
                </label>
                <textarea
                  {...register("teaching_methodology")}
                  rows={3}
                  placeholder="Describe your teaching approach and methods..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                {errors.teaching_methodology && (
                  <p className="text-xs text-error mt-1">{errors.teaching_methodology.message}</p>
                )}
              </div>

              <Input
                {...register("intro_video_url")}
                id="intro_video_url"
                label="Introduction Video URL (optional)"
                placeholder="https://youtube.com/watch?v=..."
                error={errors.intro_video_url?.message}
              />
            </div>
          )}

          {/* Step 2: Qualifications */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {qualifications.length > 0 && (
                <div className="space-y-3">
                  {qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <div className="font-medium text-sm text-foreground">{qual.title}</div>
                        <div className="text-xs text-muted-foreground">{qual.institution} ({qual.year})</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="text-muted-foreground hover:text-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-xl border-2 border-dashed border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Add Qualification</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newQual.title}
                    onChange={(e) => setNewQual({ ...newQual, title: e.target.value })}
                    placeholder="Degree / Certificate title"
                    className="w-full rounded-xl border border-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newQual.institution}
                      onChange={(e) => setNewQual({ ...newQual, institution: e.target.value })}
                      placeholder="Institution"
                      className="w-full rounded-xl border border-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="number"
                      value={newQual.year}
                      onChange={(e) => setNewQual({ ...newQual, year: parseInt(e.target.value) })}
                      placeholder="Year"
                      className="w-full rounded-xl border border-input px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQualification}
                    disabled={!newQual.title || !newQual.institution}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Qualification
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Qualifications are optional but help build trust with students.</p>
            </div>
          )}

          {/* Step 3: Subjects & Rate */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Subjects You Teach <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        selectedSubjects.includes(subject)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30 text-foreground"
                      }`}
                    >
                      {selectedSubjects.includes(subject) && <Check className="w-3 h-3 inline mr-1" />}
                      {subject}
                    </button>
                  ))}
                </div>
                {selectedSubjects.length === 0 && stepError && (
                  <p className="text-xs text-error mt-2">Please select at least one subject.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("hourly_rate", { valueAsNumber: true })}
                  id="hourly_rate"
                  type="number"
                  label="Hourly Rate *"
                  placeholder="25.00"
                  icon={<DollarSign className="w-4 h-4" />}
                  error={errors.hourly_rate?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
                  <select
                    {...register("rate_currency")}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                  {submitError}
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                <p className="text-sm text-foreground">{getValues("bio") || <span className="text-error">Not set</span>}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Experience</h3>
                  <p className="text-sm text-foreground">{getValues("experience_years")} years</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Rate</h3>
                  <p className={`text-sm ${!getValues("hourly_rate") ? "text-error" : "text-foreground"}`}>
                    {getValues("hourly_rate")
                      ? `${getValues("rate_currency")} ${getValues("hourly_rate")}/hr`
                      : "Not set — go back to Step 3"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Qualifications</h3>
                {qualifications.length > 0 ? (
                  <ul className="space-y-1">
                    {qualifications.map((q, i) => (
                      <li key={i} className="text-sm text-foreground">
                        {q.title} — {q.institution} ({q.year})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No qualifications added</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Subjects</h3>
                {selectedSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-error">No subjects selected — go back to Step 3</p>
                )}
              </div>
            </div>
          )}

          {/* Step-level error */}
          {stepError && currentStep !== 3 && (
            <p className="mt-4 text-sm text-error">{stepError}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setStepError(""); setCurrentStep((s) => Math.max(0, s - 1)); }}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < tutorSteps.length - 1 ? (
              <Button type="button" onClick={handleContinue}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} isLoading={isLoading}>
                Submit for Review
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
