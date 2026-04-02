import connectDb from "@/db/connectDb";
import Section from "@/models/Section";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
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

    const sections = await Section.find({ courseId: new mongoose.Types.ObjectId(courseId) }).sort({ order: 1 });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error in GET /api/admin/sections:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, courseId, order } = await req.json();

    if (!title || !courseId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const section = await Section.create({
      title,
      courseId: new mongoose.Types.ObjectId(courseId),
      order,
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/sections:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}