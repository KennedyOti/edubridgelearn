"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Download, Star, BookOpen, Search, ShoppingBag,
  CheckCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight,
  Calendar, RotateCcw, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PurchasedResource {
  id: string;
  title: string;
  type: string;
  type_label: string;
  access_type: string;
  price_formatted: string;
  avg_rating: number;
  file_size_label: string;
  file_mime_type: string | null;
  preview_url: string | null;
  subject: { id: number; name: string } | null;
  education_level: { id: number; name: string } | null;
  creator: { id: string; name: string; avatar_url: string | null; role: string };
  tags: { id: number; name: string; slug: string }[];
  is_purchased: boolean;
  // From purchase record
  purchased_at: string;
  amount_paid: number;
  download_count: number;
}

interface Meta { total: number; current_page: number; last_page: number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    notes:              "bg-primary/10 text-primary",
    practice_questions: "bg-accent/10 text-accent",
    assignment:         "bg-secondary/10 text-secondary-dark",
    past_paper:         "bg-highlight/10 text-highlight",
    flashcard_deck:     "bg-info/10 text-info",
    simulation:         "bg-success/10 text-success",
    worksheet:          "bg-warning/10 text-warning",
  };
  return map[type] ?? "bg-muted text-muted-foreground";
}

// ── Resource card ─────────────────────────────────────────────────────────────

function PurchasedCard({
  resource,
  onDownload,
  busy,
}: {
  resource: PurchasedResource;
  onDownload: (id: string, title: string) => void;
  busy: string | null;
}) {
  const downloading = busy === resource.id;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Thumbnail */}
      <div className={cn("h-32 relative flex items-center justify-center overflow-hidden", typeColor(resource.type))}>
        {resource.preview_url ? (
          <img src={resource.preview_url} alt={resource.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <BookOpen className="w-12 h-12 opacity-20" />
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-success/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Owned
          </span>
        </div>
        {resource.access_type !== "free" && resource.amount_paid > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
              {resource.price_formatted}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Type */}
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeColor(resource.type))}>
            {resource.type_label}
          </span>
        </div>

        {/* Title */}
        <Link href={`/resources/${resource.id}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {resource.title}
          </h3>
        </Link>

        {/* Meta */}
        {(resource.subject || resource.education_level) && (
          <p className="text-xs text-muted-foreground">
            {[resource.education_level?.name, resource.subject?.name].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Creator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[8px] font-bold shrink-0">
            {resource.creator.name.charAt(0)}
          </div>
          {resource.creator.name}
        </div>

        {/* Rating */}
        {resource.avg_rating > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("w-3 h-3", s <= Math.round(resource.avg_rating) ? "fill-secondary text-secondary" : "text-muted-foreground/30")} />
            ))}
            <span className="text-xs text-muted-foreground">{resource.avg_rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Purchase info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(resource.purchased_at)}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {resource.download_count}x</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={() => onDownload(resource.id, resource.title)}
            disabled={downloading}
          >
            {downloading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : resource.download_count > 0
                ? <RotateCcw className="w-3.5 h-3.5" />
                : <Download className="w-3.5 h-3.5" />}
            {resource.download_count > 0 ? "Re-download" : "Download"}
          </Button>
          <Link href={`/resources/${resource.id}`}>
            <Button size="sm" variant="outline" className="px-3" title="View & Review">
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-32 bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-3.5 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded-lg w-full mt-4" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PurchasedResourcesPage() {
  const router      = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [resources, setResources] = useState<PurchasedResource[]>([]);
  const [meta,      setMeta]      = useState<Meta>({ total: 0, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [dlBusy,    setDlBusy]    = useState<string | null>(null);
  const [toast,     setToast]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (user && user.role !== "student") router.push("/resources");
  }, [isAuthenticated, user, router]);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/resources/purchased", { params: { per_page: 12, page } });
      setResources(data.data);
      setMeta(data.meta);
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleDownload = async (id: string, title: string) => {
    setDlBusy(id);
    try {
      const { data } = await api.post(`/resources/${id}/download`);
      const a    = document.createElement("a");
      a.href     = data.data.download_url;
      a.download = data.data.file_name;
      a.target   = "_blank";
      a.rel      = "noopener noreferrer";
      a.click();
      setToast({ type: "success", text: `"${title}" download started.` });
      // Refresh to update download count
      setResources((prev) => prev.map((r) => r.id === id ? { ...r, download_count: r.download_count + 1 } : r));
    } catch {
      setToast({ type: "error", text: "Download failed. Please try again." });
    } finally {
      setDlBusy(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const filtered = resources.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Toast */}
          {toast && (
            <div className={cn(
              "fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm animate-fade-up",
              toast.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
            )}>
              {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.text}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" /> My Purchases
                </h1>
                <p className="text-sm text-muted-foreground">{meta.total} resource{meta.total !== 1 ? "s" : ""} purchased</p>
              </div>
            </div>
            <Link href="/resources">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" /> Browse Marketplace
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border">
              <ShoppingBag className="w-14 h-14 text-muted-foreground/20 mb-4" />
              <h3 className="font-semibold text-foreground">
                {search ? `No results for "${search}"` : "No purchases yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {search ? "Try a different search term." : "Browse the marketplace to find study resources."}
              </p>
              {!search && (
                <Link href="/resources" className="mt-4">
                  <Button size="sm"><Search className="w-4 h-4" /> Browse Resources</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((r) => (
                <PurchasedCard key={r.id} resource={r} onDownload={handleDownload} busy={dlBusy} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
              ><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
