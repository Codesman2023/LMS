"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchPageClient({ query = "" }) {
  const [results, setResults] = useState({
    blogs: [],
    tutorials: [],
    courses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!ignore) {
        setResults(data);
        setLoading(false);
      }
    }

    if (query.trim()) {
      load();
    } else {
      setResults({ blogs: [], tutorials: [], courses: [] });
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [query]);

  const hasResults =
    results.blogs.length || results.tutorials.length || results.courses.length;

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <div className="mb-10 space-y-3 text-center">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Results for: <span className="font-semibold">{query || "..."}</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      ) : !query.trim() ? (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Enter a search term to see results.
        </div>
      ) : !hasResults ? (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          No results found.
        </div>
      ) : (
        <div className="space-y-10">
          {results.blogs.length ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Blogs</h2>
                <Link href={`/blog?q=${encodeURIComponent(query)}`} className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {results.blogs.map((blog) => (
                  <Link
                    key={blog.slug}
                    href={`/blogpost/${blog.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-white/5"
                  >
                    <p className="font-semibold line-clamp-2">{blog.title}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {blog.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {results.tutorials.length ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tutorials</h2>
                <Link href={`/tutorial?q=${encodeURIComponent(query)}`} className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {results.tutorials.map((tutorial) => (
                  <Link
                    key={tutorial.slug}
                    href={`/tutorialpost/${tutorial.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-white/5"
                  >
                    <p className="font-semibold line-clamp-2">{tutorial.title}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {tutorial.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {results.courses.length ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Courses</h2>
                <Link href={`/courses?q=${encodeURIComponent(query)}`} className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {results.courses.map((course) => (
                  <Link
                    key={course.slug}
                    href={`/courses/${course.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-white/5"
                  >
                    <p className="font-semibold line-clamp-2">{course.title}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {course.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
