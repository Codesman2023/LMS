import dbConnect from "@/db/connectDb";
import User from "@/models/User";
import Course from "@/models/Course";
import Order from "@/models/Order";
import Support from "@/models/Support";

export async function GET() {

  await dbConnect();

  // Basic counts
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalCourses = await Course.countDocuments();

  const totalSales = await Order.countDocuments({ status: "paid" });

  const paidOrders = await Order.find({ status: "paid" });

  const revenue = paidOrders.reduce(
    (sum, order) => sum + (order.amount || 0),
    0
  );

  // Recent purchases
  const recentOrders = await Order.find({ status: "paid" })
    .populate("userId", "email")
    .populate("courseId", "title")
    .sort({ createdAt: -1 })
    .limit(5);

  // Pending support requests
  const pendingSupport = await Support.countDocuments({
    status: "pending"
  });

  // Recent activities
  const recentUsers = await User.find()
    .select("email createdAt")
    .sort({ createdAt: -1 })
    .limit(3);

  const recentCourses = await Course.find()
    .select("title createdAt")
    .sort({ createdAt: -1 })
    .limit(3);

  const recentSupport = await Support.find()
    .select("subject createdAt")
    .sort({ createdAt: -1 })
    .limit(3);

  const recentPurchases = await Order.find({ status: "paid" })
    .populate("userId", "email")
    .populate("courseId", "title")
    .select("createdAt")
    .sort({ createdAt: -1 })
    .limit(3);

  // Combine and sort activities
  const activities = [
    ...recentUsers.map(user => ({
      type: "user_registered",
      message: `New user registered: ${user.email}`,
      date: user.createdAt
    })),
    ...recentCourses.map(course => ({
      type: "course_published",
      message: `New course published: ${course.title}`,
      date: course.createdAt
    })),
    ...recentSupport.map(ticket => ({
      type: "support_ticket",
      message: `Support ticket created: ${ticket.subject}`,
      date: ticket.createdAt
    })),
    ...recentPurchases.map(order => ({
      type: "purchase_completed",
      message: `New purchase: ${order.userId?.email} bought ${order.courseId?.title}`,
      date: order.createdAt
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  /* -----------------------------
     Revenue chart (last 7 days)
  ----------------------------- */

  const last7Days = await Order.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        revenue: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const salesChart = last7Days.map(item => ({
    date: item._id,
    revenue: item.revenue
  }));

  /* -----------------------------
     Course sales chart
  ----------------------------- */

  const courseSalesAgg = await Order.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: "$courseId",
        sales: { $sum: 1 }
      }
    }
  ]);

  const courses = await Course.find();

  const courseSales = courseSalesAgg.map(c => {
    const course = courses.find(
      course => course._id.toString() === c._id.toString()
    );

    return {
      course: course?.title || "Unknown",
      sales: c.sales
    };
  });

  return Response.json({
    totalUsers,
    totalCourses,
    totalSales,
    revenue,
    pendingSupport,
    recentOrders,
    salesChart,
    courseSales,
    activities
  });

}
