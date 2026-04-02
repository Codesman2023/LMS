"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function statusClasses(published) {
  return published
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function CourseSkeleton() {
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

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState("");

  async function fetchCourses() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/courses", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "published"
            ? course.published
            : !course.published;
      const matchesQuery = term
        ? [course.title, course.slug, course.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [courses, query, statusFilter]);

  async function togglePublish(id, published) {
    const previousCourses = courses;
    setLoadingId(id);
    setCourses((current) =>
      current.map((course) =>
        course._id === id ? { ...course, published: !published } : course,
      ),
    );

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      setCourses((current) =>
        current.map((course) => (course._id === id ? data : course)),
      );
    } catch (err) {
      setCourses(previousCourses);
      setError(err.message || "Unable to update course");
    } finally {
      setLoadingId("");
    }
  }

  const stats = {
    total: courses.length,
    published: courses.filter((course) => course.published).length,
    drafts: courses.filter((course) => !course.published).length,
    revenue: courses.reduce((sum, course) => sum + (course.price || 0), 0),
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Courses
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage courses, review draft status, and keep your catalog organized.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={fetchCourses} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/courses/create">
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total price
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            INR {formatPrice(stats.revenue)}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses"
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
            <CourseSkeleton />
            <CourseSkeleton />
            <CourseSkeleton />
          </div>
        ) : filteredCourses.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {course.title}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {course.slug}
                      </p>
                    </div>
                    <Badge className={statusClasses(course.published)}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {course.description || "No description added yet."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <IndianRupee className="h-4 w-4" />
                        Price
                      </div>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <BookOpen className="h-4 w-4" />
                        Lectures
                      </div>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {course.lecturesCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/courses/${course._id}/lectures`}>Lectures</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/courses/${course._id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant={course.published ? "destructive" : "default"}
                      onClick={() => togglePublish(course._id, course.published)}
                      disabled={loadingId === course._id}
                    >
                      {loadingId === course._id
                        ? "Updating..."
                        : course.published
                          ? "Unpublish"
                          : "Publish"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No courses found
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a different search, switch filters, or create a new course.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
