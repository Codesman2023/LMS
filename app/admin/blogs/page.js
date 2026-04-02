"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, FileText, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

function formatDate(value) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClasses(published) {
  return published
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function BlogSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingSlug, setDeletingSlug] = useState("");

  async function fetchBlogs() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/blogs", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load blogs");
      }

      setBlogs(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "published"
            ? blog.published
            : !blog.published;
      const matchesQuery = term
        ? [blog.title, blog.slug, blog.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [blogs, query, statusFilter]);

  async function handleDelete(slug) {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const previousBlogs = blogs;
    setDeletingSlug(slug);
    setBlogs((current) => current.filter((blog) => blog.slug !== slug));

    try {
      const res = await fetch(`/api/admin/blogs?slug=${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete blog");
      }
    } catch (err) {
      setBlogs(previousBlogs);
      setError(err.message || "Unable to delete blog");
    } finally {
      setDeletingSlug("");
    }
  }

  const stats = {
    total: blogs.length,
    published: blogs.filter((blog) => blog.published).length,
    drafts: blogs.filter((blog) => !blog.published).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Blogs
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage blog posts, review drafts, and keep publishing organized.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={fetchBlogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/blogs/create">
                <Plus className="h-4 w-4" />
                Create Blog
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.published}</CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.drafts}</CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={statusFilter === filter.value ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <section>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        ) : filteredBlogs.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <Card key={blog.slug} className="border-slate-200 dark:border-slate-800">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {blog.title}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {blog.slug}
                      </p>
                    </div>
                    <Badge className={statusClasses(blog.published)}>
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {blog.description || "No description added yet."}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(blog.date)}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/blogpost/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                      View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/blogs/edit/${blog.slug}`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(blog.slug)}
                      disabled={deletingSlug === blog.slug}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingSlug === blog.slug ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No blogs found
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a different search, switch filters, or create a new blog.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
