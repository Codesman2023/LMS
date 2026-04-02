"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then(setCourses);
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
