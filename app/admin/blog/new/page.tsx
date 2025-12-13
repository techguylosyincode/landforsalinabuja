import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MarkdownEditor from "@/components/editor/MarkdownEditor";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://landforsaleinabuja.ng").replace(/\/$/, "");

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ");
}

function countWords(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

async function getWriterClient() {
    const reader = await createServerSupabase();
    const { data: { user } } = await reader.auth.getUser();
    const writer = process.env.SUPABASE_SERVICE_KEY ? createAdminClient() : reader;
    return { writer, userId: user?.id ?? null };
}

async function createPost(formData: FormData) {
    "use server";

    const { writer, userId } = await getWriterClient();

    const title = (formData.get("title") as string || "").trim();
    const slugInput = (formData.get("slug") as string || "").trim();
    const category = (formData.get("category") as string || "").trim();
    const tagsRaw = (formData.get("tags") as string || "").trim();
    const focusKeyword = (formData.get("focus_keyword") as string || "").trim();
    const excerptInput = (formData.get("excerpt") as string || "").trim();
    const content = (formData.get("content") as string || "").trim();
    const imageUrlInput = (formData.get("image_url") as string || "").trim();
    const canonicalInput = (formData.get("canonical_url") as string || "").trim();
    const metaTitleInput = (formData.get("meta_title") as string || "").trim();
    const metaDescriptionInput = (formData.get("meta_description") as string || "").trim();
    const statusInput = (formData.get("status") as string || "draft").trim() as "draft" | "published" | "scheduled";
    const noindex = formData.get("noindex") === "on";
    const scheduledRaw = (formData.get("scheduled_for") as string || "").trim();
    const coverFile = formData.get("cover") as File | null;

    if (!title) {
        redirect("/admin/blog/new?error=Title%20is%20required");
    }
    if (!content) {
        redirect("/admin/blog/new?error=Content%20cannot%20be%20empty");
    }

    const slug = slugInput || slugify(title);
    const cleanedExcerpt = (excerptInput || stripHtml(content)).slice(0, 260).trim();
    const metaTitle = (metaTitleInput || title).slice(0, 60);
    const metaDescription = (metaDescriptionInput || cleanedExcerpt).slice(0, 160);
    const focus = focusKeyword || slugify(title).replace(/-/g, " ");
    const canonicalUrl = canonicalInput || `${SITE_URL}/blog/${slug}`;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    const plainText = stripHtml(content);
    const wordCount = countWords(plainText);
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const nowIso = new Date().toISOString();
    const scheduledDate = statusInput === "scheduled" && scheduledRaw ? new Date(scheduledRaw) : null;
    if (statusInput === "scheduled" && scheduledDate && isNaN(scheduledDate.getTime())) {
        redirect("/admin/blog/new?error=Invalid%20schedule%20date");
    }
    const scheduledFor = statusInput === "scheduled" && scheduledDate ? scheduledDate.toISOString() : null;
    const isPublished = statusInput === "published";
    const publishedAt = isPublished ? nowIso : null;

    // Handle optional cover upload (requires service key + blog-assets bucket and policy)
    let imageUrl = imageUrlInput;
    if (!imageUrl && coverFile && coverFile.size > 0) {
        if (!process.env.SUPABASE_SERVICE_KEY) {
            redirect("/admin/blog/new?error=Image%20upload%20needs%20SUPABASE_SERVICE_KEY%20and%20blog-assets%20bucket");
        }
        const ext = coverFile.name.split(".").pop() || "jpg";
        const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const upload = await writer.storage.from("blog-assets").upload(path, coverFile, {
            cacheControl: "3600",
            upsert: true,
        });
        if (upload.error) {
            redirect(`/admin/blog/new?error=${encodeURIComponent(`Image upload failed: ${upload.error.message}`)}`);
        }
        const { data } = writer.storage.from("blog-assets").getPublicUrl(path);
        imageUrl = data.publicUrl;
    }

    const { error } = await writer
        .from("blog_posts")
        .insert({
            title,
            slug,
            category: category || null,
            tags,
            excerpt: cleanedExcerpt,
            content,
            image_url: imageUrl || null,
            og_image_url: imageUrl || null,
            meta_title: metaTitle,
            meta_description: metaDescription,
            focus_keyword: focus,
            canonical_url: canonicalUrl,
            status: statusInput,
            published: isPublished,
            published_at: publishedAt,
            scheduled_for: scheduledFor,
            noindex,
            reading_time: readingTime,
            word_count: wordCount,
            author_id: userId,
        })
        .single();

    if (error) {
        redirect(`/admin/blog/new?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect("/admin/blog");
}

export default async function NewBlogPostPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const error = params?.error;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Create New Post</h1>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form action={createPost} className="space-y-10">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required placeholder="How to Verify C of O in Abuja" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" name="slug" placeholder="how-to-verify-c-of-o-abuja" />
                        <p className="text-xs text-gray-500">Used when status is "Schedule".</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="Market Analysis" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" name="tags" placeholder="abuja, verification, c-of-o" />
                        <p className="text-xs text-gray-500">Used when status is "Schedule".</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="focus_keyword">Focus Keyword</Label>
                        <Input id="focus_keyword" name="focus_keyword" placeholder="verify c of o in abuja" />
                        <p className="text-xs text-gray-500">Used when status is "Schedule".</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="canonical_url">Canonical URL</Label>
                        <Input id="canonical_url" name="canonical_url" placeholder={`${SITE_URL}/blog/my-slug`} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input id="meta_title" name="meta_title" placeholder="60 characters max recommended" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                            id="meta_description"
                            name="meta_description"
                            rows={3}
                            placeholder="140-160 characters recommended"
                        />
                    </div>
                </section>

                <section className="space-y-3">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                        id="excerpt"
                        name="excerpt"
                        required
                        rows={3}
                        placeholder="Short summary for cards and meta if blank."
                    />
                </section>

                <section className="space-y-3">
                    <Label htmlFor="content">Content (supports Markdown)</Label>
                    <MarkdownEditor name="content" placeholder="Write your story here..." />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="image_url">Cover Image URL</Label>
                        <Input id="image_url" name="image_url" placeholder="https://..." />
                        <p className="text-xs text-gray-500">Will also be used for Open Graph if provided.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover">Or Upload Cover (blog-assets bucket)</Label>
                        <Input id="cover" name="cover" type="file" accept="image/*" />
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            defaultValue="draft"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Publish now</option>
                            <option value="scheduled">Schedule</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scheduled_for">Scheduled For</Label>
                        <Input id="scheduled_for" name="scheduled_for" type="datetime-local" />
                        <p className="text-xs text-gray-500">Used when status is "Schedule".</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="noindex"
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span>Noindex</span>
                        </Label>
                        <p className="text-xs text-gray-500">Avoid indexing drafts/landing-style posts.</p>
                    </div>
                </section>

                <section className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
                    <p className="font-semibold text-gray-900">SEO checklist (server-enforced)</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Title/meta title length trimmed to best-practice ranges</li>
                        <li>Meta description defaults from excerpt and is capped</li>
                        <li>Focus keyword stored for future scoring</li>
                        <li>Word count & reading time calculated server-side</li>
                        <li>Canonical + Open Graph image persisted with the post</li>
                    </ul>
                </section>

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" asChild>
                        <Link href="/admin/blog">Cancel</Link>
                    </Button>
                    <Button type="submit">
                        Save Post
                    </Button>
                </div>
            </form>
        </div>
    );
}

