import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Lecture from "@/models/Lecture";
import Course from "@/models/Course";
import Order from "@/models/Order";
import LectureRating from "@/models/LectureRating";
import { getCurrentUser } from "@/lib/auth";

async function getAuthorizedLecture(lectureId) {
  await connectDb();

  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ message: "Login required" }, { status: 401 }) };
  }

  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    return { error: NextResponse.json({ message: "Lecture not found" }, { status: 404 }) };
  }

  const course = await Course.findById(lecture.courseId);
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

  return { user, lecture, course };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const { error, user, lecture } = await getAuthorizedLecture(id);

  if (error) {
    return error;
  }

  const rating = await LectureRating.findOne({
    userId: user._id,
    lectureId: lecture._id,
  }).lean();

  const [avg] = await LectureRating.aggregate([
    { $match: { lectureId: lecture._id } },
    {
      $group: {
        _id: "$lectureId",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json({
    rating: rating?.rating || null,
    averageRating: avg?.averageRating || 0,
    ratingCount: avg?.ratingCount || 0,
  });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { error, user, lecture, course } = await getAuthorizedLecture(id);

  if (error) {
    return error;
  }

  const { rating } = await req.json();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "Rating must be an integer between 1 and 5" },
      { status: 400 },
    );
  }

  const saved = await LectureRating.findOneAndUpdate(
    {
      userId: user._id,
      lectureId: lecture._id,
    },
    {
      $set: {
        rating,
        courseId: course._id,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return NextResponse.json({
    rating: saved.rating,
  });
}
