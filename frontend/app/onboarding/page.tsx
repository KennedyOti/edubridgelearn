"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import {
  GraduationCap,
  Globe,
  BookOpen,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";

interface CurriculumData {
  education_levels: { value: string; label: string; group: string }[];
  grades: Record<string, string[]>;
}

interface SubjectOption {
  id: number;
  name: string;
  code: string;
  short_name: string | null;
  color_hex: string | null;
}

interface CountryOption {
  id: number;
  name: string;
  code: string | null;
}

interface SchoolOption {
  id: number;
  name: string;
  city: string | null;
  type: string | null;
}

interface GoalOption {
  id: number;
  label: string;
}

const steps = [
  { title: "Education Level", icon: GraduationCap, description: "What best describes your education?" },
  { title: "Your Details", icon: Globe, description: "Tell us more about where you study" },
  { title: "Subjects", icon: BookOpen, description: "What would you like to learn?" },
  { title: "Goals", icon: Target, description: "Set your learning goals" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([]);
  const [countryId, setCountryId] = useState<number | "">("");
  const [error, setError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [formData, setFormData] = useState({
    education_level: "",
    curriculum: "",
    grade: "",
    institution: "",
    country: "",
    subjects: [] as string[],
    learning_goals: [] as string[],
  });

  const loadOptions = useCallback(() => {
    setOptionsLoading(true);
    setOptionsError("");
    api
      .get("/curriculum/options")
      .then(({ data }) => {
        const payload = data.data as CurriculumData;
        setCurriculumData(payload);
        if (!payload?.education_levels?.length) {
          setOptionsError(
            "No curriculum options are available yet. Please contact support or try again shortly."
          );
        }
      })
      .catch(() => {
        setOptionsError("We couldn't load the onboarding options. Please try again.");
      })
      .finally(() => setOptionsLoading(false));

    // Country & learning-goal lists are admin-managed; failures here are
    // non-blocking (the steps that use them are optional).
    api.get("/options/countries").then(({ data }) => setCountries(data.data)).catch(() => setCountries([]));
    api.get("/options/learning-goals").then(({ data }) => setGoalOptions(data.data)).catch(() => setGoalOptions([]));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/");
      return;
    }
    loadOptions();
  }, [user, router, loadOptions]);

  // Load schools whenever the selected country changes
  useEffect(() => {
    if (countryId === "") {
      setSchools([]);
      return;
    }
    api
      .get(`/options/countries/${countryId}/schools`)
      .then(({ data }) => setSchools(data.data as SchoolOption[]))
      .catch(() => setSchools([]));
  }, [countryId]);

  useEffect(() => {
    if (formData.education_level) {
      api
        .get(`/curriculum/subjects/${formData.education_level}`)
        .then(({ data }) => {
          setSubjects(data.data as SubjectOption[]);
        })
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
  }, [formData.education_level]);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      learning_goals: prev.learning_goals.includes(goal)
        ? prev.learning_goals.filter((g) => g !== goal)
        : [...prev.learning_goals, goal],
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/students/onboarding", formData);
      updateUser({
        student_profile: {
          ...user?.student_profile,
          education_level: formData.education_level,
          curriculum: formData.curriculum,
          grade: formData.grade,
          institution: formData.institution,
          subjects: formData.subjects,
          learning_goals: formData.learning_goals,
          preferred_schedule: null,
          onboarding_completed: true,
        },
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const respErrors = e.response?.data?.errors;
      if (respErrors && typeof respErrors === "object" && !Array.isArray(respErrors)) {
        const firstKey = Object.keys(respErrors)[0];
        setError(respErrors[firstKey]?.[0] || "Could not complete onboarding. Please try again.");
      } else {
        setError(e.response?.data?.message || "Could not complete onboarding. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.education_level;
      case 1: return true;
      case 2: return formData.subjects.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const grades = curriculumData?.grades[formData.education_level] || [];

  const levelGroups = curriculumData
    ? Object.entries(
        curriculumData.education_levels.reduce((acc, level) => {
          if (!acc[level.group]) acc[level.group] = [];
          acc[level.group].push(level);
          return acc;
        }, {} as Record<string, typeof curriculumData.education_levels>)
      )
    : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Welcome{mounted && user?.name ? `, ${user.name}` : ""}!</h1>
              <p className="text-sm text-muted-foreground">Let&apos;s set up your learning profile</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Skip for now
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
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
                  <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{steps[currentStep].description}</h2>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          {optionsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="mt-4 text-sm">Loading your onboarding options…</p>
            </div>
          ) : optionsError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-error mb-4">{optionsError}</p>
              <Button onClick={loadOptions} variant="outline">
                Try again
              </Button>
            </div>
          ) : (
          <>
          {/* Step 1: Education Level */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {levelGroups.map(([group, levels]) => (
                <div key={group}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{group}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {levels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => {
                          updateField("education_level", level.value);
                          updateField("curriculum", group);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          formData.education_level === level.value
                            ? "border-primary bg-primary-50"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {grades.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Grade / Year</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => updateField("grade", grade)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          formData.grade === grade
                            ? "border-primary bg-primary-50 text-primary"
                            : "border-border hover:border-primary/30 text-foreground"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                <select
                  value={countryId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : "";
                    setCountryId(id);
                    const selected = countries.find((c) => c.id === id);
                    updateField("country", selected?.name || "");
                    updateField("institution", "");
                  }}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">School / Institution (optional)</label>
                <select
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  disabled={countryId === ""}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {countryId === ""
                      ? "Select a country first"
                      : schools.length === 0
                      ? "No schools listed for this country yet"
                      : "Select your school"}
                  </option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                      {s.city ? ` — ${s.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Subjects */}
          {currentStep === 2 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Select the subjects you&apos;d like to focus on</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.name)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      formData.subjects.includes(subject.name)
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {formData.subjects.includes(subject.name) && <Check className="w-3 h-3 inline mr-1" />}
                    {subject.name}
                  </button>
                ))}
              </div>
              {formData.subjects.length > 0 && (
                <p className="text-sm text-primary mt-3 font-medium">
                  {formData.subjects.length} subject{formData.subjects.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 3 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">What are your learning goals? (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.label)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left cursor-pointer ${
                      formData.learning_goals.includes(goal.label)
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {formData.learning_goals.includes(goal.label) && <Check className="w-3 h-3 inline mr-1" />}
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} isLoading={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
