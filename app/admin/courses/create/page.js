"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCourse() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnail: "",
  });

  const submit = async () => {
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/admin/courses");
  };

return (
  <div className="min-h-screen flex justify-center items-start p-4 sm:p-8 bg-white dark:bg-slate-950">

    <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">
        Create Course
      </h1>

      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Course Title
          </label>
          <input
            placeholder="Enter course title"
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
            onChange={e =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Description
          </label>
          <textarea
            rows="4"
            placeholder="Enter course description"
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black resize-none"
            onChange={e =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Thumbnail URL
          </label>
          <input
            placeholder="Paste thumbnail image URL"
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
            onChange={e =>
              setForm({ ...form, thumbnail: e.target.value })
            }
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Course Price
          </label>
          <input
            type="number"
            placeholder="Enter price"
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
            onChange={e =>
              setForm({
                ...form,
                price: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Button */}
        <button
          onClick={submit}
          className="w-full bg-black hover:bg-slate-800 transition text-white py-2.5 rounded-lg font-medium"
        >
          Save Draft
        </button>

      </div>
    </div>
  </div>
);
}