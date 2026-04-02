import { NextResponse } from "next/server";
import crypto from "node:crypto";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import CourseProgress from "@/models/CourseProgress";
import Lecture from "@/models/Lecture";
import { getCurrentUser } from "@/lib/auth";

function buildProgressPayload(progress, course) {
  const totalLectures = course?.totalLectures || 0;
  const completedLectureIds =
    progress?.completedLectureIds?.map((lectureId) => lectureId.toString()) || [];
  const completedLecturesCount = completedLectureIds.length;
  const isCompleted =
    totalLectures > 0 && completedLecturesCount >= totalLectures;

  return {
    completedLectureIds,
    completedLecturesCount,
    totalLectures,
    isCompleted,
    certificateIssuedAt: progress?.certificateIssuedAt || null,
    certificateId: progress?.certificateId || null,
  };
}

async function getAuthorizedCourse(slug) {
  await connectDb();

  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ message: "Login required" }, { status: 401 }) };
  }

  const course = await Course.findOne({ slug, published: true });
  if (!course) {
    return {
      error: NextResponse.json({ message: "Course not found" }, { status: 404 }),
    };
  }

  const order = await Order.findOne({
    userId: user._id,
    courseId: course._id,
    status: "paid",
  });

  if (!order) {
    return {
      error: NextResponse.json({ message: "Access denied" }, { status: 403 }),
    };
  }

  const totalLectures = await Lecture.countDocuments({ courseId: course._id });

  return {
    user,
    course: {
      ...course.toObject(),
      totalLectures,
    },
  };
}

export async function GET(req, { params }) {
  const { slug } = await params;
  const { error, user, course } = await getAuthorizedCourse(slug);

  if (error) {
    return error;
  }

  const progress = await CourseProgress.findOne({
    userId: user._id,
    courseId: course._id,
  }).lean();

  return NextResponse.json(buildProgressPayload(progress, course));
}

export async function PATCH(req, { params }) {
  const { slug } = await params;
  const { error, user, course } = await getAuthorizedCourse(slug);

  if (error) {
    return error;
  }

  const { lectureId, completed } = await req.json();

  if (!lectureId || typeof completed !== "boolean") {
    return NextResponse.json(
      { message: "lectureId and completed are required" },
      { status: 400 },
    );
  }

  const lecture = await Lecture.findOne({
    _id: lectureId,
    courseId: course._id,
  }).select("_id");

  if (!lecture) {
    return NextResponse.json({ message: "Lecture not found" }, { status: 404 });
  }

  const existingProgress = await CourseProgress.findOne({
    userId: user._id,
    courseId: course._id,
  }).select("completedLectureIds");

  const alreadyCompleted = existingProgress?.completedLectureIds?.some(
    (completedLectureId) => completedLectureId.toString() === lecture._id.toString(),
  );

  if (!completed && alreadyCompleted) {
    return NextResponse.json(
      { message: "Completed lectures cannot be unmarked" },
      { status: 400 },
    );
  }

  const update = completed
    ? { $addToSet: { completedLectureIds: lecture._id } }
    : { $pull: { completedLectureIds: lecture._id } };

  let progress = await CourseProgress.findOneAndUpdate(
    {
      userId: user._id,
      courseId: course._id,
    },
    update,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  const completedLecturesCount = progress?.completedLectureIds?.length || 0;
  const totalLectures = course.totalLectures || 0;
  const isCompleted = totalLectures > 0 && completedLecturesCount >= totalLectures;

  if (isCompleted && !progress.certificateIssuedAt) {
    progress.certificateIssuedAt = new Date();
    progress.certificateId = crypto.randomUUID();
    await progress.save();
  }

  if (!isCompleted && (progress.certificateIssuedAt || progress.certificateId)) {
    progress.certificateIssuedAt = null;
    progress.certificateId = null;
    await progress.save();
  }

  return NextResponse.json(buildProgressPayload(progress, course));
}
