import { NextResponse } from "next/server";
import Course from "@/models/Course";
import connectDB from "@/db/connectDb";
import { getCurrentUser } from "@/lib/auth"; // your existing auth helper
import slugify from "slugify";

export async function POST(req) {
  await connectDB();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description, price, thumbnail } = await req.json();

  if (!title || !description || !thumbnail) {
    return NextResponse.json(
      { message: "Missing fields" },
      { status: 400 }
    );
  }

  const slug = slugify(title, { lower: true });

  const course = await Course.create({
    title,
    slug,
    description,
    price,
    thumbnail,
    instructor: user._id,
    published: false,
  });

  return NextResponse.json(course, { status: 201 });
}

export async function GET() {
  await connectDB();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const courses = await Course.find().sort({ createdAt: -1 });
  return NextResponse.json(courses);
}

