"use client";

import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface Props {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: Props) {
  return (
    <header className="h-16 border-b border-default bg-surface flex items-center justify-between px-6">
      
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
