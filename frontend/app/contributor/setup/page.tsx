"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const expertiseOptions = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Kiswahili",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Computer Science",
  "Technology",
  "Arts & Creativity",
  "Languages",
  "Social Studies",
  "Agriculture",
  "CBC Curriculum",
  "British Curriculum",
  "IGCSE / A-Level",
];

const steps = [
  { title: "About You", description: "Tell us about your expertise" },
  { title: "Review & Submit", description: "Review and submit for approval" },
];

export default function ContributorSetupPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "contributor") {
      router.push("/");
    }
  }, [user, router]);

  const toggleExpertise = (area: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!bio.trim() || bio.trim().length < 50) {
      setError("Bio must be at least 50 characters.");
      return;
    }
    if (selectedExpertise.length === 0) {
      setError("Please select at least one area of expertise.");
      return;
    }

    setIsLoading(true);
    try {
      await api.put("/contributors/profile", {
        bio: bio.trim(),
        expertise_areas: selectedExpertise,
      });
      await api.post("/contributors/submit-review");
      await fetchUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[] } } };
      setError(e.response?.data?.errors?.[0]?.message || "Failed to submit profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = currentStep === 0
    ? bio.trim().length >= 50 && selectedExpertise.length > 0
    : true;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Set Up Your Contributor Profile</h1>
              <p className="text-sm text-muted-foreground">Complete your profile to start publishing resources</p>
            </div>
          </div>

          {/* Approval notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20 mb-6">
            <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Approval Required</p>
              <p className="text-muted-foreground mt-0.5">
                Your profile will be reviewed by our team before you can start uploading resources.
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
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
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded ${index < currentStep ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">{steps[currentStep].description}</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          {/* Step 1: About You */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Professional Bio <span className="text-error">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Tell us about yourself — your background, qualifications, and what kind of resources you plan to create..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex justify-between mt-1">
                  {bio.length > 0 && bio.length < 50 && (
                    <p className="text-xs text-error">{50 - bio.length} more characters needed</p>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{bio.length}/2000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Areas of Expertise <span className="text-error">*</span>
                  <span className="ml-2 font-normal text-muted-foreground">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {expertiseOptions.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleExpertise(area)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left ${
                        selectedExpertise.includes(area)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30 text-foreground"
                      }`}
                    >
                      {selectedExpertise.includes(area) && (
                        <Check className="w-3 h-3 inline mr-1 shrink-0" />
                      )}
                      {area}
                    </button>
                  ))}
                </div>
                {selectedExpertise.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedExpertise.length} area{selectedExpertise.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                <p className="text-sm text-foreground">{bio}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpertise.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                <p className="text-sm text-foreground">
                  By submitting, your profile will be reviewed by our team. You will be notified
                  once your application is approved or if revisions are needed.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  setError("");
                  if (!canProceed) {
                    setError(bio.length < 50 ? "Bio must be at least 50 characters." : "Please select at least one area of expertise.");
                    return;
                  }
                  setCurrentStep((s) => s + 1);
                }}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isLoading}>
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
