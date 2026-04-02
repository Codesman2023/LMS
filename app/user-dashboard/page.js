"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusMeta(status) {
  if (status === "completed") {
    return {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    };
  }

  if (status === "in_progress") {
    return {
      label: "In progress",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    };
  }

  return {
    label: "Not started",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  };
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-100"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export default function UserDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const res = await fetch("/api/user/dashboard", {
          cache: "no-store",
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.message || "Failed to load dashboard");
        }

        if (!ignore) {
          setData(payload);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-900" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900"
              />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-900" />
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <Card className="border-red-200 bg-white dark:border-red-900 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Dashboard unavailable</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { user, stats, continueLearning, courses, recentActivity, purchaseHistory } =
    data;
  const overallProgress =
    stats.totalLectures > 0
      ? Math.round((stats.totalCompletedLectures / stats.totalLectures) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                User dashboard
              </Badge>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  Welcome back, {user.username}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Track your course progress, jump back into learning, and keep your
                  profile and purchases in one place.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                  Account
                </div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.isVerified ? "Verified account" : "Verification pending"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Joined {formatDate(user.joinedAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardDescription>Enrolled courses</CardDescription>
              <CardTitle className="text-3xl">{stats.enrolledCourses}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <BookOpen className="h-4 w-4" />
              Courses purchased and available
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardDescription>In progress</CardDescription>
              <CardTitle className="text-3xl">{stats.inProgressCourses}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Clock3 className="h-4 w-4" />
              Active courses you can continue
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardDescription>Completed courses</CardDescription>
              <CardTitle className="text-3xl">{stats.completedCourses}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4" />
              Finished from start to end
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="pb-3">
              <CardDescription>Lecture completion</CardDescription>
              <CardTitle className="text-3xl">{overallProgress}%</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProgressBar value={overallProgress} />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {stats.totalCompletedLectures} of {stats.totalLectures} lectures completed
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Continue learning</CardTitle>
                <CardDescription>
                  Pick up right where you left off.
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {continueLearning.length ? (
                continueLearning.map((course) => {
                  const statusMeta = getStatusMeta(course.status);

                  return (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-32 w-full rounded-xl object-cover md:w-48"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {course.title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Updated {formatDate(course.lastUpdated)}
                              </p>
                            </div>
                            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                              <span>
                                {course.completedLectures} / {course.totalLectures} lectures
                              </span>
                              <span>{course.progressPercentage}%</span>
                            </div>
                            <ProgressBar value={course.progressPercentage} />
                          </div>
                          <Button asChild className="w-fit">
                            <Link href={`/courses/${course.slug}/watch`}>
                              Continue course
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    No active course progress yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Start a purchased course and your progress will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Common things you may want to do.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/user-profile">
                    <UserCircle2 className="h-4 w-4" />
                    View profile
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/users-settings">
                    <ShieldCheck className="h-4 w-4" />
                    Account settings
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/courses">
                    <BookOpen className="h-4 w-4" />
                    Explore courses
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Your latest course progress updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length ? (
                  recentActivity.map((activity) => (
                    <Link
                      key={activity.slug}
                      href={`/courses/${activity.slug}/watch`}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">
                        {activity.courseTitle}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {activity.completedLectures} of {activity.totalLectures} lectures completed
                      </p>
                      <div className="mt-3 space-y-2">
                        <ProgressBar value={activity.progressPercentage} />
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{activity.progressPercentage}% complete</span>
                          <span>{formatDate(activity.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your course activity will appear here once you start learning.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>My courses</CardTitle>
              <CardDescription>
                All your purchased courses and their current progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {courses.length ? (
                courses.map((course) => {
                  const statusMeta = getStatusMeta(course.status);

                  return (
                    <div
                      key={course.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-44 w-full object-cover"
                      />
                      <div className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {course.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Purchased {formatDate(course.purchasedAt)}
                            </p>
                          </div>
                          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                            <span>
                              {course.completedLectures}/{course.totalLectures} lectures
                            </span>
                            <span>{course.progressPercentage}%</span>
                          </div>
                          <ProgressBar value={course.progressPercentage} />
                        </div>

                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/courses/${course.slug}/watch`}>
                            Open course
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700 md:col-span-2">
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    No purchased courses yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Once you purchase a course, it will appear here with progress tracking.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>Purchase history</CardTitle>
              <CardDescription>Your completed course payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchaseHistory.length ? (
                purchaseHistory.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {purchase.courseTitle}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(purchase.purchasedAt)}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {purchase.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Amount paid</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        INR {purchase.amount}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your paid orders will show up here once you buy a course.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
