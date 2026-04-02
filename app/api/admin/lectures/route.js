import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import cloudinary from "@/lib/cloudinary";
import Lecture from "@/models/Lecture";
import Course from "@/models/Course";
import { getCurrentUser } from "@/lib/auth";


export async function GET(req) {
  await connectDb();

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId || courseId === "undefined") {
    return NextResponse.json(
      { message: "courseId required" },
      { status: 400 }
    );
  }

  const lectures = await Lecture.find({ courseId }).sort({ order: 1 });

  return NextResponse.json(lectures);
}


export async function POST(req) {
  try {
    await connectDb();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const file = formData.get("video");
    const courseId = formData.get("courseId");
    const title = formData.get("title");
    const order = Number(formData.get("order"));
    const sectionId = formData.get("sectionId") || null;
    const isPreview = formData.get("isPreview") === "true";

    if (!file || !courseId || !title) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "lms-lectures" },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    const lecture = await Lecture.create({
      courseId,
      title,
      videoUrl: uploadResult.secure_url,
      order,
      sectionId,
      isPreview,
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { lecturesCount: 1 },
    });

    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/lectures:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}