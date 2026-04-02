"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateBlog() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "/blog.webp",
    content: "",
    published: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create blog");
      }

      router.push("/admin/blogs");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Create Blog
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Publish a new blog post with metadata, cover image, and markdown content.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Blog Title
          </label>
          <input
            type="text"
            placeholder="e.g. Best Laptop Models for Students"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-white/10 dark:bg-slate-950"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Short Description
          </label>
          <input
            type="text"
            placeholder="Short summary shown on the blog list"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-white/10 dark:bg-slate-950"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Cover Image URL
          </label>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-white/10 dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Blog Content (Markdown)
          </label>
          <textarea
            rows={16}
            placeholder="Write your blog content in Markdown..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black dark:border-white/10 dark:bg-slate-950"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Supports headings, lists, code blocks, images, and links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Publish immediately
          </span>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/blogs"
            className="text-sm text-gray-600 hover:underline dark:text-gray-300"
          >
            Back to Blogs
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-6 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}
