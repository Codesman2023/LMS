"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Typed from "typed.js";

export default function Home() {

    const el = useRef(null);
    useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "Web Development",
        "Data Science",
        "Backend Development",
        "Machine Learning",
        "Programming Languages",
      ],
      typeSpeed: 50,
      backSpeed: 35,
      backDelay: 1200,
      loop: true,
    });

    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  const [popularCourses, setPopularCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setPopularCourses(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((error) => {
        console.error("Failed to load courses:", error);
        setPopularCourses([]);
      });
  }, []);

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <section className="container px-4 py-16 mx-auto lg:flex lg:items-center lg:gap-10">
        <div className="w-full text-center lg:text-left lg:w-1/2">
          <h1 className="text-3xl font-bold leading-snug text-gray-800 dark:text-gray-200 md:text-4xl">
                <span>UpSkill in </span>  <span className="font-semibold underline decoration-primary"><span ref={el} /></span> <br className="hidden lg:block" />
            <span className="text-primary">Anytime, Anywhere</span>
          </h1>

          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
            A simple and powerful Learning Management System to
            upskill yourself with industry-ready courses.
          </p>

          <div className="flex justify-center gap-4 mt-6 lg:justify-start">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Browse Courses
            </Button>
          </div>
        </div>

        <div className="w-full mt-10 lg:mt-0 lg:w-1/2">
          <img
            src="https://www.creative-tim.com/twcomponents/svg/website-designer-bro-purple.svg"
            alt="online learning"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 ">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Why Choose Our LMS?
          </h2>

          <div className="grid gap-8 mt-10 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Expert Instructors</h3>
              <p className="mt-2 text-gray-500">
                Learn from experienced professionals and mentors.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Flexible Learning</h3>
              <p className="mt-2 text-gray-500">
                Study at your own pace with lifetime access.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <p className="mt-2 text-gray-500">
                Earn certificates to boost your resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="py-16">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Popular Courses
          </h2>

          <div className="grid gap-8 mt-10 md:grid-cols-3">
            {popularCourses.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed px-6 py-12 text-gray-500">
                Courses will appear here once published.
              </div>
            ) : (
              popularCourses.map((course) => (
                <div key={course._id} className="p-6 border rounded-lg text-left">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-40 w-full rounded-md object-cover"
                    />
                  )}
                  <h3 className="mt-4 text-lg font-semibold">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {course.description || "Explore this course to learn more."}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>{course.lecturesCount || 0} lectures</span>
                    <span>INR {course.price}</span>
                  </div>
                  <Link href={`/courses/${course.slug}`} className="inline-flex">
                    <Button className="mt-4" size="sm">
                      View Course
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold">
          Start Learning Today 🚀
        </h2>
        <p className="mt-3">
          Join thousands of learners and upgrade your skills.
        </p>
        <Link href={'/signup'}>
              <Button variant="secondary" size="lg" className="mt-6">
          Join Now
        </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-500">
        © {new Date().getFullYear()} LMS Platform. All rights reserved.
      </footer>
    </main>
  );
}
