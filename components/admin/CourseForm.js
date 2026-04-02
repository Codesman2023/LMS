"use client";

import { useEffect, useState } from "react";

export default function CourseForm({
  initialData = {},
  onSubmit,
  title = "Add Course",
  submitLabel = "Save",
  showPublish = false,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
    published: false,
    ...initialData,
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-lg font-semibold">{title}</h2>

      <input
        type="text"
        placeholder="Course Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Course Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border p-2 rounded"
        rows={3}
      />

      <input
        type="text"
        placeholder="Thumbnail URL"
        value={form.thumbnail}
        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="number"
        placeholder="Price (₹)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="w-full border p-2 rounded"
      />

      {showPublish ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm({ ...form, published: e.target.checked })
            }
          />
          Publish Course
        </label>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black hover:bg-gray-800 transition text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
