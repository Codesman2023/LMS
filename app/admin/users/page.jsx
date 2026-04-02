"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CreditCard, RefreshCw, Search, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "created", label: "Created" },
  { value: "blocked", label: "Blocked" },
];

function formatCurrency(value) {
  return `INR ${new Intl.NumberFormat("en-IN").format(value || 0)}`;
}

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

function statusClasses(status) {
  return status === "paid"
    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function PurchaseSkeleton() {
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

export default function AdminUsersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/users", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setOrders(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "blocked"
            ? Boolean(order.user?.isBlocked)
            : order.status === statusFilter;
      const matchesQuery = term
        ? [
            order.user?.username,
            order.user?.email,
            order.course?.title,
            order.course?.slug,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  async function toggleBlockUser(userId, isBlocked) {
    if (!userId) return;

    const confirmAction = confirm(
      isBlocked ? "Unblock this user?" : "Block this user?",
    );

    if (!confirmAction) return;

    const previousOrders = orders;
    setUpdatingUserId(userId);
    setOrders((current) =>
      current.map((order) =>
        order.user?._id === userId
          ? { ...order, user: { ...order.user, isBlocked: !isBlocked } }
          : order,
      ),
    );

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBlocked: !isBlocked,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update user");
      }
    } catch (err) {
      setOrders(previousOrders);
      setError(err.message || "Unable to update user");
    } finally {
      setUpdatingUserId("");
    }
  }

  const uniqueUsers = new Set(
    orders.map((order) => order.user?._id).filter(Boolean),
  ).size;
  const blockedUsers = new Set(
    orders.filter((order) => order.user?.isBlocked).map((order) => order.user?._id),
  ).size;
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Users
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review course purchases, monitor blocked accounts, and manage user access.
            </p>
          </div>

          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unique users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{uniqueUsers}</span>
            <UserRound className="h-5 w-5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Paid orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{paidOrders}</span>
            <CreditCard className="h-5 w-5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Blocked users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{blockedUsers}</span>
            <Ban className="h-5 w-5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{formatCurrency(totalRevenue)}</span>
            <ShieldCheck className="h-5 w-5 text-slate-400" />
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
              placeholder="Search users or courses"
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
            <PurchaseSkeleton />
            <PurchaseSkeleton />
            <PurchaseSkeleton />
          </div>
        ) : filteredOrders.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                        {order.user?.username || "Unknown user"}
                      </h2>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {order.user?.email || "No email"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusClasses(order.status)}>
                        {order.status}
                      </Badge>
                      {order.user?.isBlocked ? (
                        <Badge variant="outline" className="border-red-300 text-red-600 dark:border-red-800 dark:text-red-300">
                          Blocked
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {order.course?.title || "No course"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {order.course?.slug || "No slug"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-slate-500 dark:text-slate-400">Amount</p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-slate-500 dark:text-slate-400">Purchased</p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {formatDate(order.purchaseDate)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={order.user?.isBlocked ? "outline" : "destructive"}
                    onClick={() =>
                      toggleBlockUser(order.user?._id, order.user?.isBlocked)
                    }
                    disabled={!order.user?._id || updatingUserId === order.user?._id}
                  >
                    {updatingUserId === order.user?._id
                      ? "Updating..."
                      : order.user?.isBlocked
                        ? "Unblock user"
                        : "Block user"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <UserRound className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No users found
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try a different search or switch filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
