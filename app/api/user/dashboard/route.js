import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import Course from "@/models/Course";
import CourseProgress from "@/models/CourseProgress";

function buildCourseStatus(progressPercentage, totalLectures) {
  if (!totalLectures) {
    return "not_started";
  }

  if (progressPercentage >= 100) {
    return "completed";
  }

  if (progressPercentage > 0) {
    return "in_progress";
  }

  return "not_started";
}

export async function GET() {
  await connectDb();

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const paidOrders = await Order.find({
    userId: user._id,
    status: "paid",
  })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = paidOrders.map((order) => order.courseId);

  const [courses, progressEntries] = await Promise.all([
    Course.find({ _id: { $in: courseIds } })
      .select("title slug thumbnail price lecturesCount")
      .lean(),
    CourseProgress.find({
      userId: user._id,
      courseId: { $in: courseIds },
    }).lean(),
  ]);

  const courseMap = new Map(
    courses.map((course) => [course._id.toString(), course]),
  );
  const progressMap = new Map(
    progressEntries.map((entry) => [entry.courseId.toString(), entry]),
  );

  const courseItems = paidOrders
    .map((order) => {
      const course = courseMap.get(order.courseId.toString());
      if (!course) {
        return null;
      }

      const progress = progressMap.get(order.courseId.toString());
      const totalLectures = course.lecturesCount || 0;
      const completedLectures = progress?.completedLectureIds?.length || 0;
      const rawPercentage =
        totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
      const progressPercentage = Math.min(Math.round(rawPercentage), 100);
      const status = buildCourseStatus(progressPercentage, totalLectures);

      return {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        price: course.price || 0,
        totalLectures,
        completedLectures,
        progressPercentage,
        status,
        purchasedAt: order.createdAt,
        lastUpdated: progress?.updatedAt || order.createdAt,
        orderAmount: order.amount || 0,
      };
    })
    .filter(Boolean);

  const continueLearning = [...courseItems]
    .filter((course) => course.status === "in_progress")
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 3);

  const recentActivity = [...courseItems]
    .filter((course) => course.completedLectures > 0)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 5)
    .map((course) => ({
      courseTitle: course.title,
      slug: course.slug,
      completedLectures: course.completedLectures,
      totalLectures: course.totalLectures,
      progressPercentage: course.progressPercentage,
      updatedAt: course.lastUpdated,
    }));

  const stats = {
    enrolledCourses: courseItems.length,
    inProgressCourses: courseItems.filter((course) => course.status === "in_progress")
      .length,
    completedCourses: courseItems.filter((course) => course.status === "completed")
      .length,
    totalCompletedLectures: courseItems.reduce(
      (sum, course) => sum + course.completedLectures,
      0,
    ),
    totalLectures: courseItems.reduce((sum, course) => sum + course.totalLectures, 0),
  };

  const purchaseHistory = paidOrders
    .map((order) => {
      const course = courseMap.get(order.courseId.toString());
      if (!course) {
        return null;
      }

      return {
        id: order._id.toString(),
        courseTitle: course.title,
        courseSlug: course.slug,
        amount: order.amount || course.price || 0,
        status: order.status,
        purchasedAt: order.createdAt,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      joinedAt: user.createdAt,
    },
    stats,
    continueLearning,
    courses: courseItems,
    recentActivity,
    purchaseHistory,
  });
}
