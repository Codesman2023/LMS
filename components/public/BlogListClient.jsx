"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BlogListClient({ blogs }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const filteredBlogs = useMemo(() => {
    const term = query.trim().toLowerCase();

    const normalized = blogs.map((blog) => ({
      ...blog,
      published: typeof blog.published === "boolean" ? blog.published : true,
    }));

    let result = normalized.filter((blog) => {
      if (!term) return true;
      return [blog.title, blog.description, blog.author]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });

    result = [...result].sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      return bDate - aDate;
    });

    return result;
  }, [blogs, query]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 space-y-4 text-center">
        <h1 className="text-4xl font-bold">Blogs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explore tutorials, announcements, and product updates.
        </p>
      </div>

      {filteredBlogs.length ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBlogs.map((blog, index) => (
            <div
              key={`${blog.slug}-${index}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="h-56 w-full object-cover"
              />

              <div className="flex h-full flex-col p-5">
                <h2 className="mb-2 line-clamp-2 text-xl font-semibold">
                  {blog.title}
                </h2>

                <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                  {blog.description}
                </p>

                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>By {blog.author}</span> ·{" "}
                  <span>
                    {new Date(blog.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <Link
                  href={`/blogpost/${blog.slug}`}
                  className="mt-auto inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-white/5 dark:text-slate-400">
          No blogs match your search.
        </div>
      )}
    </div>
  );
}
