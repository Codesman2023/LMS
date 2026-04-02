"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTutorial() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/tutorials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content }),
    });

    setLoading(false);
    router.push("/admin/tutorials");
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Create Tutorial
        </h1>
        <p className="text-sm text-gray-500">
          Add a new tutorial using Markdown content
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
            type="text"
            placeholder="e.g. Introduction to React Hooks"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <input
            type="text"
            placeholder="Brief summary shown in tutorial listing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutorial Content (Markdown)
          </label>
          <textarea
            rows={16}
            placeholder="Write your tutorial in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports Markdown formatting (headings, code blocks, lists, etc.)
          </p>
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
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Tutorial"}
          </button>
        </div>
      </form>
    </div>
  );
}