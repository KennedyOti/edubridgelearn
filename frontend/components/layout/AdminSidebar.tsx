"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Users,
  Clock,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  X,
  BookOpen,
  Flag,
  PenTool,
  SlidersHorizontal,
} from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  tab?: string;
  badge?: number;
}

const primaryNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, tab: "overview" },
  { label: "Pending Approvals", href: "/admin/dashboard?tab=approvals", icon: Clock, tab: "approvals" },
  { label: "User Management", href: "/admin/dashboard?tab=users", icon: Users, tab: "users" },
  { label: "Create Admin", href: "/admin/dashboard?tab=create-admin", icon: UserPlus, tab: "create-admin" },
];

const secondaryNav: AdminNavItem[] = [
  { label: "Blog Moderation", href: "/admin/blog", icon: PenTool, tab: "blog" },
  { label: "Resource Moderation", href: "/admin/resources", icon: BookOpen, tab: "resources" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: Flag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  onClose?: () => void;
  activeTab?: string;
}

export function AdminSidebar({ onClose, activeTab = "overview" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Onboarding option management is super-admin only (matches the API scope).
  const systemNav: AdminNavItem[] =
    user?.role === "super_admin"
      ? [
          { label: "Onboarding Options", href: "/admin/options", icon: SlidersHorizontal, tab: "options" },
          ...secondaryNav,
        ]
      : secondaryNav;

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-white w-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">EduBridge</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Portal</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Management
        </p>
        <ul className="space-y-0.5">
          {primaryNav.map((item) => {
            const isActive = item.tab
              ? activeTab === item.tab
              : pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-error text-white min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2 mt-6">
          System
        </p>
        <ul className="space-y-0.5">
          {systemNav.map((item) => {
            const isActive = item.tab ? activeTab === item.tab : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400">
              {user?.role === "super_admin" ? "Super Admin" : "Admin"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
