"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

/**
 * /blog/[slug]/edit — resolves the slug to a UUID and redirects to
 * /blog/new?edit=<uuid>, which contains the full create/edit form.
 */
export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const slug = params.slug as string;
  const [error, setError] = useState("");

  const resolve = useCallback(async () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    try {
      // Fetch author's own posts to find the matching slug → uuid
      const { data } = await api.get("/blogs/my-posts", { params: { per_page: 50 } });
      const post = data.data.find((p: { slug: string; id: string }) => p.slug === slug);

      if (post) {
        router.replace(`/blog/new?edit=${post.id}`);
      } else {
        setError("Post not found or you don't have permission to edit it.");
      }
    } catch {
      setError("Could not load post. Please try again.");
    }
  }, [slug, isAuthenticated, user, router]);

  useEffect(() => { resolve(); }, [resolve]);

  return (
    <DashboardLayout title="Edit Post">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading post editor...</p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
