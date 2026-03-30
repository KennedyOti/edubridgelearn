"use client";

import { useState, useEffect } from "react";
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
  const [subjects, setSubjects] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    education_level: "",
    curriculum: "",
    grade: "",
    institution: "",
    country: "",
    subjects: [] as string[],
    learning_goals: [] as string[],
  });

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/");
      return;
    }
    // Fetch curriculum options
    api.get("/curriculum/options").then(({ data }) => {
      setCurriculumData(data.data);
    });
  }, [user, router]);

  useEffect(() => {
    if (formData.education_level) {
      api.get(`/curriculum/subjects/${formData.education_level}`).then(({ data }) => {
        setSubjects(data.data);
      });
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
    } catch {
      // Handle error
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

  const goalOptions = [
    "Improve grades",
    "Exam preparation",
    "Learn new skills",
    "Career development",
    "Explore new subjects",
    "Academic competitions",
    "University preparation",
    "Catch up on coursework",
  ];

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
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="e.g., Kenya"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">School / Institution (optional)</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  placeholder="e.g., Nairobi School"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      formData.subjects.includes(subject)
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {formData.subjects.includes(subject) && <Check className="w-3 h-3 inline mr-1" />}
                    {subject}
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
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left cursor-pointer ${
                      formData.learning_goals.includes(goal)
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-border hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {formData.learning_goals.includes(goal) && <Check className="w-3 h-3 inline mr-1" />}
                    {goal}
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
        </div>
      </div>
    </div>
  );
}
