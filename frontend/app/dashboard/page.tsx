"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  LogOut,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isPending = user.status === "pending_approval";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Edu<span className="text-primary">Bridge</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-error transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending approval banner */}
        {isPending && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Account Pending Approval</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your {user.role} account is under review. You&apos;ll be notified once approved.
              </p>
            </div>
          </div>
        )}

        {/* Onboarding reminder for students */}
        {user.role === "student" && !user.student_profile?.onboarding_completed && (
          <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-primary-50 border border-primary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">Set up your learning preferences for a personalized experience</p>
              </div>
            </div>
            <Link href="/onboarding">
              <Button size="sm">
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {user.role === "student"
              ? "Continue your learning journey"
              : user.role === "tutor"
              ? "Manage your tutoring sessions"
              : "Manage your content contributions"}
          </p>
        </div>

        {/* Quick actions grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.role === "student" && (
            <>
              <QuickAction
                icon={BookOpen}
                title="Find a Tutor"
                description="Browse and book sessions with expert tutors"
                color="bg-primary/10 text-primary"
                href="#"
              />
              <QuickAction
                icon={Brain}
                title="AI Teacher"
                description="Get instant help with any subject"
                color="bg-secondary/10 text-secondary"
                href="#"
              />
              <QuickAction
                icon={Users}
                title="Community"
                description="Join discussions and ask questions"
                color="bg-accent/10 text-accent"
                href="#"
              />
              <QuickAction
                icon={BookOpen}
                title="Resources"
                description="Browse study materials and past papers"
                color="bg-warning/10 text-warning"
                href="#"
              />
              <QuickAction
                icon={Trophy}
                title="Progress"
                description="Track your learning achievements"
                color="bg-success/10 text-success"
                href="#"
              />
              <QuickAction
                icon={Clock}
                title="My Sessions"
                description="View upcoming and past sessions"
                color="bg-info/10 text-info"
                href="#"
              />
            </>
          )}

          {user.role === "tutor" && (
            <>
              <QuickAction
                icon={Clock}
                title="My Sessions"
                description="View and manage your tutoring sessions"
                color="bg-primary/10 text-primary"
                href="#"
              />
              <QuickAction
                icon={BookOpen}
                title="My Courses"
                description="Create and manage your courses"
                color="bg-secondary/10 text-secondary"
                href="#"
              />
              <QuickAction
                icon={Users}
                title="My Students"
                description="View your student roster"
                color="bg-accent/10 text-accent"
                href="#"
              />
            </>
          )}

          {user.role === "contributor" && (
            <>
              <QuickAction
                icon={BookOpen}
                title="My Resources"
                description="Manage your uploaded materials"
                color="bg-primary/10 text-primary"
                href="#"
              />
              <QuickAction
                icon={DollarSignIcon}
                title="Earnings"
                description="View your earnings and withdraw"
                color="bg-success/10 text-success"
                href="#"
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  color,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </Link>
  );
}
