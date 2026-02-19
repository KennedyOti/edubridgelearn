import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Settings,
  PlusCircle,
  List,
  LucideIcon,
} from "lucide-react";

export interface SidebarRoute {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: SidebarRoute[];
}

export const primaryRoutes: SidebarRoute[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    icon: BookOpen,
    children: [
      {
        label: "All Courses",
        href: "/dashboard/courses",
        icon: List,
      },
      {
        label: "Create Course",
        href: "/dashboard/courses/create",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
];

export const secondaryRoutes: SidebarRoute[] = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
