import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";

export async function GET() {
  await connectDb();

  const courses = await Course.find({ published: true })
    .select("title slug price thumbnail lecturesCount description")
    .sort({ createdAt: -1 });

  return NextResponse.json(courses);
}
