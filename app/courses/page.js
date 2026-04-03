"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function CoursesPageContent() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetch("/api/courses")
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load courses");
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid courses response");
        }

        setCourses(data);
      })
      .catch((err) => {
        console.error("Failed to load courses:", err);
        setError(err.message || "Failed to load courses");
        setCourses([]);
      });
  }, []);

  const filteredCourses = courses.filter((course) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [course.title, course.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  });

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Premium Courses
      </h1>

      {error ? (
        <p className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">
          Courses are temporarily unavailable. Check `MONGODB_URI` in Vercel,
          MongoDB Atlas network access, and make sure your course records are
          marked as published.
        </p>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className="group flex flex-col h-full rounded-xl overflow-hidden border dark:border-white/10 
                       bg-white dark:bg-white/5 shadow-md hover:shadow-xl 
                       transition-all duration-300 hover:-translate-y-1"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-40 w-full object-cover"
            />

            <div className="p-4 space-y-3">
              <h2 className="font-semibold text-lg line-clamp-2">
                {course.title}
              </h2>

              <p className="text-sm text-gray-400 line-clamp-2">
                {course.description}
              </p>

              <div className="flex justify-between text-sm text-gray-400">
                <span>Admin</span>
                <span>Beginner</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  INR {course.price}
                </span>
              </div>

              <Link
                href={`/courses/${course.slug}`}
                className="mt-auto inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium 
                           hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black 
                           transition"
              >
                View Course →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading courses...</div>}>
      <CoursesPageContent />
    </Suspense>
  );
}
