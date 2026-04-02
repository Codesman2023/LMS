import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import CourseFeedback from "@/models/CourseFeedback";
import { getCurrentUser } from "@/lib/auth";

async function getAuthorizedCourse(slug) {
  await connectDb();

  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ message: "Login required" }, { status: 401 }) };
  }

  const course = await Course.findOne({ slug, published: true });
  if (!course) {
    return { error: NextResponse.json({ message: "Course not found" }, { status: 404 }) };
  }

  const order = await Order.findOne({
    userId: user._id,
    courseId: course._id,
    status: "paid",
  });

  if (!order) {
    return { error: NextResponse.json({ message: "Access denied" }, { status: 403 }) };
  }

  return { user, course };
}

export async function GET(req, { params }) {
  const { slug } = await params;
  const { error, user, course } = await getAuthorizedCourse(slug);

  if (error) {
    return error;
  }

  const feedback = await CourseFeedback.findOne({
    userId: user._id,
    courseId: course._id,
  }).lean();

  return NextResponse.json({
    feedback: feedback?.feedback || "",
    updatedAt: feedback?.updatedAt || null,
  });
}

export async function POST(req, { params }) {
  const { slug } = await params;
  const { error, user, course } = await getAuthorizedCourse(slug);

  if (error) {
    return error;
  }

  const { feedback } = await req.json();
  const trimmed = typeof feedback === "string" ? feedback.trim() : "";

  if (!trimmed || trimmed.length < 3) {
    return NextResponse.json(
      { message: "Feedback must be at least 3 characters" },
      { status: 400 },
    );
  }

  const saved = await CourseFeedback.findOneAndUpdate(
    {
      userId: user._id,
      courseId: course._id,
    },
    {
      $set: {
        feedback: trimmed,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return NextResponse.json({
    feedback: saved.feedback,
    updatedAt: saved.updatedAt,
  });
}
