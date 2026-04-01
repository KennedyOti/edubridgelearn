"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  Trophy,
  Clock,
  DollarSign,
  BarChart3,
  FileText,
  Flag,
  Shield,
  PenTool,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navConfig: Record<string, NavItem[]> = {
  student: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Find a Tutor", href: "/tutors", icon: Users },
    { label: "My Sessions", href: "/sessions", icon: Clock },
    { label: "Lessons", href: "/lessons", icon: BookOpen },
    { label: "AI Teacher", href: "/ai-teacher", icon: Brain },
    { label: "Resources", href: "/resources", icon: FileText },
    { label: "Progress", href: "/progress", icon: Trophy },
    { label: "Community", href: "/community", icon: Users },
  ],
  tutor: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Sessions", href: "/sessions", icon: Clock },
    { label: "My Lessons", href: "/tutor/lessons", icon: BookOpen },
    { label: "My Students", href: "/students", icon: Users },
    { label: "Earnings", href: "/earnings", icon: DollarSign },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Resources", href: "/resources", icon: FileText },
  ],
  contributor: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Resources", href: "/resources", icon: FileText },
    { label: "Earnings", href: "/earnings", icon: DollarSign },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Blog", href: "/blog", icon: PenTool },
  ],
  moderator: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Flagged Content", href: "/flagged", icon: Flag },
    { label: "Content Review", href: "/content-review", icon: FileText },
    { label: "Community", href: "/community", icon: Users },
    { label: "User Reports", href: "/reports", icon: Shield },
  ],
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = navConfig[user?.role ?? "student"] ?? [];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-border w-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Edu<span className="text-primary">Bridge</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
          Main Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                        isActive ? "bg-white/25 text-white" : "bg-error text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-border p-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div
            suppressHydrationWarning
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p suppressHydrationWarning className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p suppressHydrationWarning className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-error transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
