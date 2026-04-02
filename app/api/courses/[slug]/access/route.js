import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, props) {
  await connectDb();

  const params = await props.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ access: false });
  }

  const course = await Course.findOne({ slug: params.slug });
  if (!course) {
    return NextResponse.json({ access: false });
  }

  const order = await Order.findOne({
    userId: user._id,
    courseId: course._id,
    status: "paid",
  });

  return NextResponse.json({
    access: !!order,
  });
}