"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTutorial() {
  const { slug } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
    published: true,
  });

  // 🔹 Fetch tutorial data
  useEffect(() => {
    async function fetchTutorial() {
      const res = await fetch(`/api/admin/tutorials/${slug}`);
      const data = await res.json();

      setForm({
        title: data.title,
        description: data.description,
        content: data.content,
        image: data.image || "/tutorial.webp",
        published: data.published,
      });

      setLoading(false);
    }

    fetchTutorial();
  }, [slug]);

  // 🔹 Update tutorial
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/admin/tutorials/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    router.push("/admin/tutorials");
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center text-gray-500 py-20">
        Loading tutorial data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Tutorial
        </h1>
        <p className="text-sm text-gray-500">
          Update tutorial content, image, and publish status
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg shadow-sm p-6 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutorial Title
          </label>
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tutorial title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Brief summary for listing page"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image URL
          </label>
          <input
            value={form.image}
            onChange={(e) =>
              setForm({ ...form, image: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutorial Content (Markdown)
          </label>
          <textarea
            rows={16}
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Write tutorial content in Markdown..."
            required
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm({ ...form, published: e.target.checked })
            }
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">
            Published (uncheck to save as draft)
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Link
            href="/admin/tutorials"
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back to Tutorials
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Tutorial"}
          </button>
        </div>
      </form>
    </div>
  );
}