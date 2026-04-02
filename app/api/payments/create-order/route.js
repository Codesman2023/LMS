import Razorpay from "razorpay";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDb();

    // 1. Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Parse body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ message: "courseId is required." }, { status: 400 });
    }

    // 3. Find course
    let course;
    try {
      course = await Course.findById(courseId);
    } catch (err) {
      console.error("[create-order] Course lookup error:", err.message);
      return NextResponse.json({ message: "Invalid courseId format." }, { status: 400 });
    }

    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    // 4. Validate price
    const price = Number(course.price);
    if (!price || price <= 0) {
      console.error("[create-order] Invalid course price:", course.price);
      return NextResponse.json({ message: "Course price is invalid." }, { status: 400 });
    }

    // 5. Check for existing pending order (avoid duplicates)
    const existingOrder = await Order.findOne({
      userId: user._id,
      courseId,
      status: "created",
    });

    if (existingOrder) {
      // Reuse the existing Razorpay order instead of creating a new one
      const existingRazorpayOrder = await razorpay.orders.fetch(existingOrder.razorpayOrderId);
      return NextResponse.json(existingRazorpayOrder);
    }

    // 6. Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(price * 100), // paise, must be integer
        currency: "INR",
        receipt: `rcpt_${courseId}_${user._id}`.slice(0, 40), // max 40 chars
      });
    } catch (err) {
      console.error("[create-order] Razorpay error:", err);
      return NextResponse.json(
        { message: "Payment gateway error. Check your Razorpay credentials.", detail: err.message },
        { status: 502 }
      );
    }

    // 7. Save order to DB
    await Order.create({
      userId: user._id,
      courseId,
      razorpayOrderId: razorpayOrder.id,
      amount: price,
      status: "created",
    });

    return NextResponse.json(razorpayOrder);
  } catch (err) {
    // Catch-all so the client always gets JSON, never a blank 500
    console.error("[create-order] Unhandled error:", err);
    return NextResponse.json(
      { message: "Internal server error.", detail: err.message },
      { status: 500 }
    );
  }
}