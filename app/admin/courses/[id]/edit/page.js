"use client";

import { useEffect, useState } from "react";
import { use } from "react";

export default function EditCoursePage({ params }) {
  const { id } = use(params);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
    published: false,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ---------------- FETCH COURSE ---------------- */

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        const data = await res.json();

        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          thumbnail: data.thumbnail || "",
          published: data.published || false,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchCourse();
  }, [id]);

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ---------------- UPDATE COURSE ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("✅ Course updated successfully");

      setForm({
      title: "",
      description: "",
      price: "",
      thumbnail: "",
      published: false,
    });

    } catch (err) {
      console.error(err);
      alert("❌ Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (fetching) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">Edit Course</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow space-y-4"
      >

        {/* TITLE */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Course Title"
          className="w-full border p-2 rounded"
          required
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Course Description"
          className="w-full border p-2 rounded"
          rows={4}
          required
        />

        {/* PRICE */}
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
        />

        {/* THUMBNAIL */}
        <input
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="Thumbnail URL"
          className="w-full border p-2 rounded"
        />

        {/* PUBLISH */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          Publish Course
        </label>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Updating..." : "Update Course"}
        </button>

      </form>
    </div>
  );
}