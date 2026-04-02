"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ModeToggle } from "@/components/theme-btn";
// import LoadingBar from "react-top-loading-bar";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Redirect to home if not admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    setProgress(20);

    setTimeout(() => {
      setProgress(40);
    }, 100);

    setTimeout(() => {
      setProgress(100);
    }, 400);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => {
      setProgress(0);
    }, 50);
  }, []);

  return (
    <nav className="p-4 bg-background/50 sticky top-0 backdrop-blur border-b z-10">
      <LoadingBar
        color="#933ce6"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/admin/dashboard"}>
          <div className="text-lg font-bold">Admin Pannel</div>
        </Link>
        <div className="hidden md:flex space-x-4 items-center">
          <Link
            href="/admin/dashboard"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
            {" "}
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
            Users
          </Link>
          <Link
            href="/admin/notes"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
            Notes
          </Link>
          <Link
            href="/admin/courses"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
            Courses
          </Link>
          <Link
            href="/admin/blogs"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
           Blogs
          </Link>
          <Link
            href="/admin/tutorials"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
           Tutorials
          </Link>
          <Link
            href="/admin/support"
            className="hover:scale-105 hover:font-semibold transition-transform duration-300"
          >
            Support page
          </Link>
          <div className="flex items-center">
            {!session ? (
              <>
                <Button className="mx-1" variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              </>
            ) : (
              <Button
                className="mx-1" 
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>

        <div className="md:hidden">
          <span className="mx-2">
            <ModeToggle />
          </span>
          <Sheet>
            <SheetTrigger>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-bold my-4">MY-LMS</SheetTitle>
                <SheetDescription>
                  <div className="flex flex-col gap-6">
                    <Link href="/admin/dashboard"> Dashboard</Link>
                    <Link href="/admin/users"> Users</Link>
                    <Link href="/admin/blogs">Blogs</Link>
                    <Link href="/admin/notes">Notes</Link>
                    <Link href="/admin/tutorials">Tutorials</Link>
                    <Link href="/admin/courses">Courses</Link>
                    <Link href="/admin/support">Support Page</Link>
                    <div>
                      {!session ? (
                        <>
                          <Button className="mx-1 text-xs" variant="outline">
                            <Link href="/login">Login</Link>
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="mx-1 text-xs"
                          variant="destructive"
                          onClick={() => signOut({ callbackUrl: "/" })}
                        >
                          Logout
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
