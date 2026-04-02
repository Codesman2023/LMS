import { NextResponse } from "next/server";
import Course from "@/models/Course";
import connectDB from "@/db/connectDb";
import { getCurrentUser } from "@/lib/auth";
import slugify from "slugify";

export async function GET(req, { params }) {
  await connectDB();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const course = await Course.findById((await params).id);
  return NextResponse.json(course);
}

export async function PUT(req, { params }) {
  await connectDB();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updatedData = { ...body };

  if (body.title) {
    updatedData.slug = slugify(body.title, { lower: true });
  }

  const course = await Course.findByIdAndUpdate(
    (await params).id,
    updatedData,
    { new: true }
  );

  return NextResponse.json(course);
}
