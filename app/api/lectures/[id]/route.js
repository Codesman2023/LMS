import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Lecture from "@/models/Lecture";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req, props) {
  await connectDb();

  const params = await props.params;

  const lecture = await Lecture.findById(params.id);
  if (!lecture) {
    return NextResponse.json({ message: "Lecture not found" }, { status: 404 });
  }

  // Preview lectures are public
  if (lecture.isPreview) {
    return NextResponse.json({
      title: lecture.title,
      videoUrl: lecture.videoUrl,
    });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  // ✅ FIX: Guard against missing course
  const course = await Course.findById(lecture.courseId);
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const order = await Order.findOne({
    userId: user._id,
    courseId: course._id,
    status: "paid",
  });

  if (!order) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({
    title: lecture.title,
    videoUrl: lecture.videoUrl,
  });
}