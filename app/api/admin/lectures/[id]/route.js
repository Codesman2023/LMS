import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Lecture from "@/models/Lecture";
import Course from "@/models/Course";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req, { params }) {
  await connectDb();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const lecture = await Lecture.findById(id);
  if (!lecture) {
    return NextResponse.json({ message: "Lecture not found" }, { status: 404 });
  }

  await Lecture.findByIdAndDelete(id);

  // decrease lecture count
  await Course.findByIdAndUpdate(lecture.courseId, {
    $inc: { lecturesCount: -1 },
  });

  return NextResponse.json({ message: "Lecture deleted" });
}