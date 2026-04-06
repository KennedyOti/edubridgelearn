"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Image,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  color_hex: string;
}

interface FormData {
  title: string;
  body: string;
  excerpt: string;
  category_id: string;
  featured_image_url: string;
  tags: string;
  seo_title: string;
  seo_description: string;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {children}{required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-xl border ${error ? "border-error bg-error/5" : "border-border bg-white"} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors`;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NewBlogPostPage() {
  return (
    <Suspense fallback={
      <DashboardLayout title="New Blog Post">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    }>
      <NewBlogPostInner />
    </Suspense>
  );
}

function NewBlogPostInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  // Support editing existing post via ?edit=uuid
  const editUuid = searchParams.get("edit");

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormData>({
    title: "",
    body: "",
    excerpt: "",
    category_id: "",
    featured_image_url: "",
    tags: "",
    seo_title: "",
    seo_description: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedUuid, setSavedUuid] = useState<string | null>(editUuid);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(!!editUuid);
  const [tagInput, setTagInput] = useState("");

  const canWrite = isAuthenticated && user &&
    ["contributor", "tutor", "admin", "super_admin"].includes(user.role);

  const isAdmin = isAuthenticated && user && ["admin", "super_admin"].includes(user.role);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!canWrite) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, canWrite, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/blogs/categories");
      setCategories(data.data);
    } catch {
      // silent
    }
  }, []);

  const fetchPost = useCallback(async (uuid: string) => {
    setIsLoadingPost(true);
    try {
      const { data } = await api.get(`/blogs/my-posts/${uuid}`);
      const post = data.data;
      setForm({
        title: post.title ?? "",
        body: post.body ?? "",
        excerpt: post.excerpt ?? "",
        category_id: post.category?.id?.toString() ?? "",
        featured_image_url: post.featured_image_url ?? "",
        tags: post.tags?.map((t: { name: string }) => t.name).join(", ") ?? "",
        seo_title: post.seo_metadata?.title ?? "",
        seo_description: post.seo_metadata?.description ?? "",
      });
    } catch {
      // silent
    } finally {
      setIsLoadingPost(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    if (editUuid) fetchPost(editUuid);
  }, [editUuid, fetchPost]);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.body.trim() || form.body.trim().length < 50) e.body = "Body must be at least 50 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    body: form.body.trim(),
    excerpt: form.excerpt.trim() || undefined,
    category_id: form.category_id ? parseInt(form.category_id) : undefined,
    featured_image_url: form.featured_image_url.trim() || undefined,
    tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    seo_metadata: (form.seo_title || form.seo_description)
      ? { title: form.seo_title || undefined, description: form.seo_description || undefined }
      : undefined,
  });

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      let uuid = savedUuid;
      if (uuid) {
        await api.put(`/blogs/${uuid}`, buildPayload());
      } else {
        const { data } = await api.post("/blogs", buildPayload());
        uuid = data.data.id;
        setSavedUuid(uuid!);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const mapped: Partial<FormData> = {};
        Object.keys(apiErrors).forEach((key) => {
          (mapped as Record<string, string>)[key] = (apiErrors[key] as string[])[0];
        });
        setErrors(mapped);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validate()) return;

    // For admins — save and immediately publish
    // For others — save then submit for review
    setIsSubmitting(true);
    try {
      let uuid = savedUuid;
      if (uuid) {
        await api.put(`/blogs/${uuid}`, buildPayload());
      } else {
        const { data } = await api.post("/blogs", buildPayload());
        uuid = data.data.id;
        setSavedUuid(uuid!);
      }

      if (!isAdmin) {
        await api.post(`/blogs/${uuid}/submit`);
      }

      setSubmitSuccess(true);
      setTimeout(() => router.push("/blog/my-posts"), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const mapped: Partial<FormData> = {};
        Object.keys(apiErrors).forEach((key) => {
          (mapped as Record<string, string>)[key] = (apiErrors[key] as string[])[0];
        });
        setErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const existing = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    if (!existing.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...existing, tagInput.trim()].join(", ") }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const existing = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    setForm((f) => ({ ...f, tags: existing.filter((t) => t !== tag).join(", ") }));
  };

  const parsedTags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (isLoadingPost) {
    return (
      <DashboardLayout title={editUuid ? "Edit Post" : "New Blog Post"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (submitSuccess) {
    return (
      <DashboardLayout title="Post Submitted">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isAdmin ? "Post Published!" : "Submitted for Review!"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            {isAdmin
              ? "Your post is now live on the blog."
              : "Our team will review your post and publish it shortly. You'll be notified once it's live."}
          </p>
          <p className="text-xs text-muted-foreground mt-4">Redirecting to My Posts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={editUuid ? "Edit Post" : "New Blog Post"}>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/blog/my-posts">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> My Posts</Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4" /> {previewMode ? "Edit" : "Preview"}
            </Button>

            {saveSuccess && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              isLoading={isSaving}
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitForReview}
              isLoading={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isAdmin ? "Publish" : "Submit for Review"}
            </Button>
          </div>
        </div>

        {/* Preview mode */}
        {previewMode ? (
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="max-w-2xl mx-auto">
              {form.category_id && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                  style={{ backgroundColor: categories.find(c => c.id.toString() === form.category_id)?.color_hex ?? "#4F46E5" }}>
                  {categories.find(c => c.id.toString() === form.category_id)?.name}
                </span>
              )}
              <h1 className="text-3xl font-bold text-foreground mb-3">{form.title || "Your title will appear here"}</h1>
              {form.excerpt && <p className="text-lg text-muted-foreground border-l-4 border-primary/30 pl-4 mb-6">{form.excerpt}</p>}
              {form.featured_image_url && (
                <img src={form.featured_image_url} alt="Featured" className="w-full rounded-xl mb-6 object-cover max-h-80" />
              )}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: form.body || "<p class='text-muted-foreground'>Start writing your post...</p>" }}
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main editor — left 2 columns */}
            <div className="lg:col-span-2 space-y-4">

              {/* Title */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <FormLabel required>Title</FormLabel>
                <input
                  type="text"
                  placeholder="Write a compelling title..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={`${inputClass(errors.title)} text-lg font-semibold`}
                />
                {errors.title && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
              </div>

              {/* Body */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Content <span className="text-error">*</span></span>
                  </div>
                  <span className="text-xs text-muted-foreground">HTML supported</span>
                </div>
                <textarea
                  placeholder="Write your article here... HTML is supported for formatting."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={24}
                  className={`${inputClass(errors.body)} font-mono resize-y min-h-[400px]`}
                />
                {errors.body && <p className="text-xs text-error mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.body}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  {form.body.trim() ? `~${Math.ceil(form.body.split(/\s+/).length / 200)} min read · ${form.body.split(/\s+/).length} words` : "0 words"}
                </p>
              </div>

              {/* Excerpt */}
              <Section title="Excerpt (optional)" icon={FileText}>
                <FormLabel>Short summary shown in listings</FormLabel>
                <textarea
                  placeholder="A brief, engaging summary of your post (auto-generated if left blank)..."
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={3}
                  className={inputClass()}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{form.excerpt.length}/500</p>
              </Section>
            </div>

            {/* Sidebar — right column */}
            <div className="space-y-4">

              {/* Publish info */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm">
                <p className="font-semibold text-foreground mb-1">
                  {isAdmin ? "Publish immediately" : "Submit for review"}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {isAdmin
                    ? "As an admin, your post will go live immediately when you publish."
                    : "Your post will be reviewed by an admin before going live. Save as draft first to continue editing."}
                </p>
              </div>

              {/* Category */}
              <Section title="Category" icon={FileText}>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className={inputClass()}
                >
                  <option value="">— No category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </Section>

              {/* Featured image */}
              <Section title="Featured Image" icon={Image}>
                <FormLabel>Image URL</FormLabel>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.featured_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))}
                  className={inputClass()}
                />
                {form.featured_image_url && (
                  <img
                    src={form.featured_image_url}
                    alt="Preview"
                    className="mt-2 rounded-xl w-full object-cover max-h-32"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </Section>

              {/* Tags */}
              <Section title="Tags" icon={Tag}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    className={`${inputClass()} flex-1`}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}>Add</Button>
                </div>
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-error transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* SEO */}
              <Section title="SEO (optional)" icon={FileText}>
                <div className="space-y-3">
                  <div>
                    <FormLabel>SEO Title</FormLabel>
                    <input
                      type="text"
                      placeholder="Custom page title (max 60 chars)"
                      value={form.seo_title}
                      onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                      maxLength={60}
                      className={inputClass()}
                    />
                    <p className="text-xs text-muted-foreground text-right mt-0.5">{form.seo_title.length}/60</p>
                  </div>
                  <div>
                    <FormLabel>Meta Description</FormLabel>
                    <textarea
                      placeholder="Short description for search engines (max 160 chars)"
                      value={form.seo_description}
                      onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                      rows={3}
                      maxLength={160}
                      className={`${inputClass()} resize-none`}
                    />
                    <p className="text-xs text-muted-foreground text-right">{form.seo_description.length}/160</p>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
