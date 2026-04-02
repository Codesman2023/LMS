"use client";
import React from "react";
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

import { ModeToggle } from "./theme-btn";
// import LoadingBar from "react-top-loading-bar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { User, LogOut, Settings, Search, Menu } from "lucide-react";

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("blog");
  const { data: session, status } = useSession();

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

  useEffect(() => {
    if (pathname.startsWith("/search")) {
      setSearchScope("all");
      return;
    }
    if (pathname.startsWith("/tutorial")) {
      setSearchScope("tutorial");
      return;
    }
    if (pathname.startsWith("/courses")) {
      setSearchScope("courses");
      return;
    }
    setSearchScope("blog");
  }, [pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const target =
      searchScope === "all"
        ? "/search"
        : searchScope === "tutorial"
          ? "/tutorial"
          : searchScope === "courses"
            ? "/courses"
            : "/blog";
    const trimmed = searchQuery.trim();
    router.push(trimmed ? `${target}?q=${encodeURIComponent(trimmed)}` : target);
  };

  return (
    <nav className="p-6 bg-background/50 sticky top-0 backdrop-blur border-b z-10">
      <LoadingBar
        color="#933ce6"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link href={"/"}>
          <div className="text-lg font-bold">MY-LMS</div>
        </Link>
        <div className="hidden min-[1250px]:flex flex-1 flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Home
            </Link>
            <Link href="/notes" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Notes
            </Link>
            <Link href="/tutorial" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Tutorial
            </Link>
            <Link href="/courses" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Courses
            </Link>
            <Link href="/blog" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Blog
            </Link>
            <Link href="/contact" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Contact
            </Link>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:justify-end"
          >
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search content"
              className="min-w-[180px] flex-1 md:max-w-[260px] lg:max-w-[320px]"
            />
            <select
              value={searchScope}
              onChange={(event) => setSearchScope(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-auto"
            >
              <option value="all">All</option>
              <option value="blog">Blogs</option>
              <option value="tutorial">Tutorials</option>
              <option value="courses">Courses</option>
            </select>
            <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
              Search
            </Button>
          </form>

          <div className="flex items-center space-x-2 md:ml-auto">
            {!session ? (
              <>
                <Button variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="outline">
                  <Link href="/signup">Signup</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-muted transition">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href="/user-profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/user-dashboard" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-500 focus:text-red-500"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ModeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 min-[1250px]:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-[800px]:flex min-w-0 flex-1 items-center justify-end gap-2"
          >
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search content"
              className="w-full max-w-[320px]"
            />
            <select
              value={searchScope}
              onChange={(event) => setSearchScope(event.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="all">All</option>
              <option value="blog">Blogs</option>
              <option value="tutorial">Tutorials</option>
              <option value="courses">Courses</option>
            </select>
            <Button type="submit" size="sm" variant="outline">
              Search
            </Button>
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-[800px]:hidden"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="border-b">
              <SheetHeader>
                <SheetTitle className="font-bold">Search</SheetTitle>
                <SheetDescription>
                  Search blogs, tutorials, and courses from any device.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSearchSubmit} className="mt-6 space-y-3">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search content"
                  className="h-10"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={searchScope}
                    onChange={(event) => setSearchScope(event.target.value)}
                    className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="all">All</option>
                    <option value="blog">Blogs</option>
                    <option value="tutorial">Tutorials</option>
                    <option value="courses">Courses</option>
                  </select>
                  <Button type="submit" variant="outline" className="w-full sm:w-auto">
                    Search
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {!session ? (
            <div className="hidden items-center gap-2 min-[800px]:flex">
              <Button variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline">
                <Link href="/signup">Signup</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden rounded-full p-2 transition hover:bg-muted min-[800px]:inline-flex">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/user-profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/user-dashboard" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-500 focus:text-red-500"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ModeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-bold my-4">MY-LMS</SheetTitle>
                <SheetDescription>
                  <div className="flex flex-col gap-6">
                    <Link href="/">Home</Link>
                    <Link href="/notes">Notes</Link>
                    <Link href="/tutorial">Tutorials</Link>
                    <Link href="/courses">Courses</Link>
                    <Link href="/blog">Blog</Link>
                    <Link href="/contact">Contact</Link>
                    <DropdownMenuSeparator />
                    <Link href="/user-dashboard">Dashboard</Link>
                    <Link href="/user-profile">Profile</Link>
                    <div>
                      {!session ? (
                        <>
                          <Button className="mx-1 text-xs" variant="outline">
                            <Link href="/login">Login</Link>
                          </Button>
                          <Button className="mx-1 text-xs" variant="outline">
                            <Link href="/signup">Signup</Link>
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
