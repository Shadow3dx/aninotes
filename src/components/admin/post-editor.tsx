"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Save, Tv, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PostContent } from "@/components/posts/post-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPost, updatePost } from "@/actions/posts";

import { MarkdownToolbar } from "@/components/admin/markdown-toolbar";
import { slugify } from "@/lib/utils";
import type { Post, Tag, Category } from "@prisma/client";

interface PostEditorProps {
  post?: Post & {
    tags: { tagId: string }[];
    categories: { categoryId: string }[];
  };
  allTags: Tag[];
  allCategories: Category[];
}

export function PostEditor({ post, allTags, allCategories }: PostEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.contentMarkdown ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [reviewType, setReviewType] = useState(post?.reviewType ?? "ANIME");
  const [animeTitle, setAnimeTitle] = useState(post?.animeTitle ?? "");
  const [episodeNumber, setEpisodeNumber] = useState(
    post?.episodeNumber?.toString() ?? "1"
  );
  const [season, setSeason] = useState(post?.season ?? "");
  const [mangaTitle, setMangaTitle] = useState(post?.mangaTitle ?? "");
  const [chapterNumber, setChapterNumber] = useState(
    post?.chapterNumber?.toString() ?? "1"
  );
  const [rating, setRating] = useState(post?.rating?.toString() ?? "7");
  const [status, setStatus] = useState(post?.status ?? "DRAFT");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags.map((t) => t.tagId) ?? []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories.map((c) => c.categoryId) ?? []
  );
  const [dirty, setDirty] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!post) {
      setSlug(slugify(title));
    }
  }, [title, post]);

  // Warn on unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("slug", slug);
      formData.set("excerpt", excerpt);
      formData.set("contentMarkdown", content);
      formData.set("coverImage", coverImage);
      formData.set("reviewType", reviewType);
      formData.set("animeTitle", animeTitle);
      formData.set("episodeNumber", episodeNumber);
      formData.set("season", season);
      formData.set("mangaTitle", mangaTitle);
      formData.set("chapterNumber", chapterNumber);
      formData.set("rating", rating);
      formData.set("status", status);
      for (const tagId of selectedTags) {
        formData.append("tagIds", tagId);
      }
      for (const catId of selectedCategories) {
        formData.append("categoryIds", catId);
      }

      if (post) {
        await updatePost(post.id, formData);
        toast.success("Post updated!");
      } else {
        const result = await createPost(formData);
        toast.success("Post created!");
        router.push(`/admin/posts/${result.id}/edit`);
      }
      setDirty(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save post"
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tagId: string) {
    markDirty();
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  }

  function toggleCategory(catId: string) {
    markDirty();
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((c) => c !== catId)
        : [...prev, catId]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
            placeholder="Episode review title..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              markDirty();
            }}
            placeholder="url-friendly-slug"
            required
          />
        </div>
      </div>

      {/* Review Type + Details */}
      <div className="rounded-lg border border-border/50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary">Review Type</h3>
          <div className="flex rounded-md border">
            <button
              type="button"
              onClick={() => {
                setReviewType("ANIME");
                markDirty();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                reviewType === "ANIME"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } rounded-l-md`}
            >
              <Tv className="h-3.5 w-3.5" />
              Anime
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewType("MANGA");
                markDirty();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                reviewType === "MANGA"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } rounded-r-md`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Manga
            </button>
          </div>
        </div>

        {reviewType === "ANIME" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="animeTitle">Anime Title</Label>
              <Input
                id="animeTitle"
                value={animeTitle}
                onChange={(e) => {
                  setAnimeTitle(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Attack on Titan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                value={season}
                onChange={(e) => {
                  setSeason(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Season 4 Part 2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episodeNumber">Episode #</Label>
              <Input
                id="episodeNumber"
                type="number"
                min="0"
                value={episodeNumber}
                onChange={(e) => {
                  setEpisodeNumber(e.target.value);
                  markDirty();
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="rating"
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => {
                    setRating(e.target.value);
                    markDirty();
                  }}
                  className="flex-1 accent-primary"
                />
                <span className="w-8 text-center text-lg font-bold text-primary">
                  {rating}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mangaTitle">Manga Title</Label>
              <Input
                id="mangaTitle"
                value={mangaTitle}
                onChange={(e) => {
                  setMangaTitle(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. One Piece"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterNumber">Chapter #</Label>
              <Input
                id="chapterNumber"
                type="number"
                min="0"
                value={chapterNumber}
                onChange={(e) => {
                  setChapterNumber(e.target.value);
                  markDirty();
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="rating"
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => {
                    setRating(e.target.value);
                    markDirty();
                  }}
                  className="flex-1 accent-primary"
                />
                <span className="w-8 text-center text-lg font-bold text-primary">
                  {rating}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Excerpt + Cover Image */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              markDirty();
            }}
            placeholder="Brief summary..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image URL</Label>
          <Input
            id="coverImage"
            value={coverImage}
            onChange={(e) => {
              setCoverImage(e.target.value);
              markDirty();
            }}
            placeholder="https://example.com/image.jpg"
          />
          {coverImage && (
            <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tags & Categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={
                  selectedTags.includes(tag.id) ? "default" : "secondary"
                }
                className="cursor-pointer"
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant={
                  selectedCategories.includes(cat.id) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="w-48 space-y-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            markDirty();
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Markdown Editor */}
      <div className="space-y-2">
        <Label>Content (Markdown)</Label>
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <MarkdownToolbar
              textareaRef={textareaRef}
              onUpdate={(v) => {
                setContent(v);
                markDirty();
              }}
            />
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                markDirty();
              }}
              placeholder="Write your review in Markdown..."
              className="min-h-[400px] rounded-t-none font-mono text-sm"
              required
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-h-[400px] rounded-lg border p-6">
              {content ? (
                <PostContent content={content} />
              ) : (
                <p className="text-muted-foreground">
                  Nothing to preview yet...
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
        {dirty && (
          <span className="text-sm text-muted-foreground">
            Unsaved changes
          </span>
        )}
      </div>
    </form>
  );
}
