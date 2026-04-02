"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClasses(status) {
  return status === "resolved"
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function MessageSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/support", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load support requests");
      }

      setMessages(data);

      if (!selectedId && data.length) {
        setSelectedId(data[0]._id);
      } else if (selectedId && !data.some((item) => item._id === selectedId)) {
        setSelectedId(data[0]?._id || "");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const term = query.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus =
        statusFilter === "all" ? true : message.status === statusFilter;
      const matchesQuery = term
        ? [message.name, message.email, message.subject, message.message]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [messages, query, statusFilter]);

  const selectedMessage =
    filteredMessages.find((message) => message._id === selectedId) ||
    filteredMessages[0] ||
    null;

  async function markResolved(id) {
    const previousMessages = messages;

    setUpdatingId(id);
    setMessages((current) =>
      current.map((message) =>
        message._id === id ? { ...message, status: "resolved" } : message,
      ),
    );

    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update support request");
      }

      setMessages((current) =>
        current.map((message) => (message._id === id ? data : message)),
      );
    } catch (err) {
      setMessages(previousMessages);
      setError(err.message || "Unable to update support request");
    } finally {
      setUpdatingId("");
    }
  }

  const stats = {
    total: messages.length,
    pending: messages.filter((message) => message.status === "pending").length,
    resolved: messages.filter((message) => message.status === "resolved").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Support
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review support requests, track pending items, and resolve them from one place.
            </p>
          </div>

          <Button variant="outline" onClick={loadMessages} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.pending}</CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.resolved}</CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search support requests"
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

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
              </div>
            ) : filteredMessages.length ? (
              filteredMessages.map((message) => {
                const active = selectedMessage?._id === message._id;

                return (
                  <button
                    key={message._id}
                    type="button"
                    onClick={() => setSelectedId(message._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-50 dark:border-slate-200 dark:bg-slate-800"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {message.name}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {message.email}
                        </p>
                      </div>
                      <Badge className={getStatusClasses(message.status)}>
                        {message.status}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="line-clamp-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {message.subject || "No subject"}
                      </p>
                      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {message.message}
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(message.createdAt)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <MessageSquareText className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  No requests found
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try a different search or switch the status filter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Request details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                          {selectedMessage.subject || "No subject"}
                        </h2>
                        <Badge className={getStatusClasses(selectedMessage.status)}>
                          {selectedMessage.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Received {formatDate(selectedMessage.createdAt)}
                      </p>
                    </div>

                    {selectedMessage.status === "pending" ? (
                      <Button
                        onClick={() => markResolved(selectedMessage._id)}
                        disabled={updatingId === selectedMessage._id}
                      >
                        {updatingId === selectedMessage._id
                          ? "Updating..."
                          : "Mark resolved"}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Already resolved
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Sender
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedMessage.name}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Email
                    </p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="mt-2 inline-flex text-lg font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Full message
                  </p>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-200">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <Mail className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  Select a support request
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Choose a request from the left to read the full message.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
