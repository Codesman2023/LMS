import crypto from "crypto";
import connectDb from "@/db/connectDb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import sendPurchaseEmail from "@/lib/sendPurchaseEmail";

export async function POST(req) {
  await connectDb();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
    },
    { new: true }
  )
    .populate("userId", "email username")
    .populate("courseId", "title price");

  if (order?.userId?.email) {
    try {
      await sendPurchaseEmail({
        to: order.userId.email,
        userName: order.userId.username,
        courseTitle: order.courseId?.title,
        amount: order.amount ?? order.courseId?.price,
        orderId: order._id?.toString(),
      });
    } catch (emailError) {
      console.error("Purchase email failed:", emailError);
    }
  }

  return NextResponse.json({ success: true, order });
}
