"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function maskEmail(email) {
  if (!email || !email.includes("@")) {
    return "";
  }

  const [localPart, domain] = email.split("@");
  const visiblePart = localPart.slice(0, 2);
  const maskedPart = "*".repeat(Math.max(localPart.length - 2, 1));

  return `${visiblePart}${maskedPart}@${domain}`;
}

function VerifyEmailNoticeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResend() {
    if (!email) {
      setError("Missing email address. Please sign up again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend verification email");
      } else {
        setSuccess("A new verification email has been sent.");
      }
    } catch (resendError) {
      console.error("Resend email error:", resendError);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/50 dark:border-white/10 shadow-xl bg-white dark:bg-white/5">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription>
            We sent a verification link to your inbox.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-sm text-center">
            {email ? (
              <span>
                Verification mail sent to <strong>{maskEmail(email)}</strong>
              </span>
            ) : (
              <span>Verification mail sent. Please check your inbox.</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Open the email and click the verification link to activate your
            account.
          </p>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              className="w-full"
              onClick={handleResend}
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Resend verification email"}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailNoticePage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailNoticeContent />
    </Suspense>
  );
}
