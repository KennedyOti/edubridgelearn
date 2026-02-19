"use client";

import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    primaryRoutes,
    secondaryRoutes,
    SidebarRoute,
} from "@/config/dashboard/sidebar.routes";

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ open, setOpen }: Props) {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<string | null>(null);

    // 🔥 Auto expand parent if child is active
    useEffect(() => {
        primaryRoutes.forEach((route) => {
            if (
                route.children?.some((child) =>
                    pathname.startsWith(child.href || "")
                )
            ) {
                setExpanded(route.label);
            }
        });
    }, [pathname]);

    const toggleExpand = (label: string) => {
        setExpanded((prev) => (prev === label ? null : label));
    };

    const renderRoute = (route: SidebarRoute) => {
        const Icon = route.icon;
        const hasChildren = !!route.children;

        const isActive =
            route.href && pathname === route.href;

        const isParentActive =
            route.children?.some((child) =>
                pathname.startsWith(child.href || "")
            );

        if (hasChildren) {
            return (
                <div key={route.label}>
                    <button
                        onClick={() => toggleExpand(route.label)}
                        className={`
              w-full flex items-center justify-between px-4 py-2 rounded-lg transition-theme
              ${isParentActive
                                ? "bg-neutral-100 dark:bg-neutral-700 font-medium"
                                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            }
            `}
                    >
                        <div className="flex items-center gap-3">
                            {Icon && <Icon size={18} className="text-muted" />}
                            {route.label}
                        </div>

                        <ChevronDown
                            size={16}
                            className={`transition-transform ${expanded === route.label ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {expanded === route.label && (
                        <div className="ml-6 mt-2 space-y-1">
                            {route.children!.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildActive =
                                    pathname === child.href;

                                return (
                                    <Link
                                        key={child.href}
                                        href={child.href!}
                                        className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-theme
                      ${isChildActive
                                                ? "bg-neutral-100 dark:bg-neutral-700 font-medium"
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            }
                    `}
                                    >
                                        {ChildIcon && (
                                            <ChildIcon
                                                size={16}
                                                className="text-muted"
                                            />
                                        )}
                                        {child.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={route.href}
                href={route.href!}
                className={`
          flex items-center gap-3 px-4 py-2 rounded-lg transition-theme
          ${isActive
                        ? "bg-neutral-100 dark:bg-neutral-700 font-medium"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }
        `}
            >
                {Icon && <Icon size={18} className="text-muted" />}
                {route.label}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed lg:static z-50 top-0 left-0 inset-y-0
                    w-64
                    bg-surface border-r border-default
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    flex flex-col
                `}
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-default">
                    <h2 className="text-lg font-semibold text-brand">
                        EduBridgeLearn
                    </h2>

                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden text-muted"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col justify-between p-4 text-sm">

                    {/* Primary Routes */}
                    <div className="space-y-2">
                        {primaryRoutes.map((route) =>
                            renderRoute(route)
                        )}
                    </div>

                    {/* Bottom Section */}
                    <div className="pt-4 border-t border-default space-y-2">
                        {secondaryRoutes.map((route) =>
                            renderRoute(route)
                        )}
                    </div>

                </nav>
            </aside>
        </>
    );
}
