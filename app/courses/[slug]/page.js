"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";
export default function CourseDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [openSection, setOpenSection] = useState(null);

const toggleSection = (id) => {
  setOpenSection(openSection === id ? null : id);
};

const getLecturesForSection = (sectionId) => {
  if (!data?.lectures) return [];
  // lectures store their parent section in `sectionId` field
  return data.lectures.filter((lec) => lec.sectionId === sectionId);
};

useEffect(() => {
  fetch(`/api/courses/${slug}/access`)
    .then(res => res.json())
    .then(data => setHasAccess(data.access));
}, [slug]);

  // Check if Razorpay is already loaded
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/courses/${slug}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Failed to fetch course:", err));
  }, [slug]);

  // ✅ Defined here so `course` from `data` is accessible
  const buyCourse = async () => {
    if (!data) return;
    const { course } = data;

    if (!razorpayLoaded) {
      alert("Payment SDK not loaded. Please refresh and try again.");
      return;
    }

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });

      // ✅ Handle non-OK responses before parsing JSON
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Create order failed:", errorData);
        alert(errorData.message || "Failed to create order. Please try again.");
        return;
      }

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: course.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              alert(errData.message || "Payment verification failed.");
              return;
            }

            alert("Payment successful! You now have access to the course.");
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {},
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error("buyCourse error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!data) return <div className="p-10 text-foreground">Loading...</div>;

  const { course, lectures, sections } = data;

  if (!course) return <div className="p-10 text-foreground">Course not found</div>;

return (
  <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 text-foreground">
    
    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 lg:gap-12">
      
      {/* ================= LEFT SECTION ================= */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            {course?.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {course?.description}
          </p>
        </div>

        {/* What You'll Learn */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-5">
            What you'll learn
          </h2>

          <ul className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
            {[
              "Industry-ready skills",
              "Real-world projects",
              "Hands-on learning",
              "Lifetime access"
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span className="text-green-600">✔</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Course Content */}
<div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-lg">
  <h2 className="text-lg sm:text-xl font-semibold mb-5">
    Course Content
  </h2>

  <div className="space-y-4">
    {sections?.map((section) => {
      const sectionLectures = getLecturesForSection(section._id);
      const isOpen = openSection === section._id;

      return (
        <div
          key={section._id}
          className="overflow-hidden rounded-xl border border-border"
        >
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section._id)}
            className="flex w-full items-center justify-between bg-muted/80 px-4 py-3 font-bold transition hover:bg-muted"
          >
            {section.order}. {section.title}
            <span>{isOpen ? "▲" : "▼"}</span>
          </button>

          {/* Lectures Dropdown */}
          {isOpen && (
            <ul className="divide-y divide-border bg-card/40">
              {sectionLectures?.map((lec, i) => (
                <li
                  key={lec?._id}
                  className="flex items-center justify-between px-4 py-3 transition hover:bg-muted/70"
                >
                  {/* Lecture Title */}
                  {lec?.isPreview ||  hasAccess ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/courses/${course?.slug}/watch?lecture=${lec?._id}`
                        )
                      }
                      className="text-left font-medium text-foreground transition hover:text-primary hover:underline"
                    >
                      {lec.order}. {lec.title}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">
                      {lec.order}. {lec.title}
                    </span>
                  )}

                  {/* Lecture Status */}
                  {lec?.isPreview ? (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Preview
                    </span>
                  ) : !hasAccess ? (
                    <span className="text-sm text-muted-foreground/80">
                      🔒 Locked
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    })}
  </div>
</div>
      </div>

      {/* ================= RIGHT SIDEBAR ================= */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/85 shadow-lg backdrop-blur-lg">
          
          {/* Thumbnail */}
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={course?.thumbnail}
              alt={course?.title}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </div>

          <div className="p-6">
            {/* Price */}
            <div className="text-2xl sm:text-3xl font-bold mb-6">
              ₹{course?.price}
            </div>

            {/* Buttons */}
            {hasAccess ? (
              <button
                onClick={() => router.push(`/courses/${course?.slug}/watch`)}
                className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-medium"
              >
                Start Learning
              </button>
            ) : !isLoggedIn ? (
              <button
                onClick={() =>
                  router.push(`/login?redirect=/courses/${course?.slug}`)
                }
                className="w-full rounded-xl bg-foreground py-3 font-medium text-background transition hover:opacity-90"
              >
                Login to Buy
              </button>
            ) : (
              <button
                onClick={buyCourse}
                disabled={!razorpayLoaded}
                className="w-full rounded-xl bg-foreground py-3 font-medium text-background transition hover:opacity-90 disabled:opacity-50"
              >
                {razorpayLoaded ? "Buy Course" : "Loading..."}
              </button>
            )}

            {/* Course Info */}
            <hr className="my-6 border-border" />
            <ul className="space-y-3 text-sm text-muted-foreground">
             <h2 className="font-bold text-xl">This course includes:</h2>
              <li>✔ {lectures?.length || 0} Lectures</li>
              <li>✔ Lifetime Access</li>
              <li>✔ Certificate of Completion</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      onLoad={() => setRazorpayLoaded(true)}
      onError={() => console.error("Failed to load Razorpay SDK")}
    />
  </div>
);
}
