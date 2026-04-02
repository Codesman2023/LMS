import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Lecture from "@/models/Lecture";
import Section from "@/models/Section";

export async function GET(req, { params }) {
  await connectDb();

  const { slug } = await params;

  const course = await Course.findOne({
    slug,
    published: true,
  });

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const lectures = await Lecture.find({ courseId: course._id })
    // include sectionId so client can group lectures by their section
    .select("title order isPreview sectionId")
    .sort({ order: 1 });  // This sorts lectures by the order field in ascending order.

  const sections = await Section.find({ courseId: course._id }).sort({ order: 1 });

  return NextResponse.json({ course, lectures, sections });
}