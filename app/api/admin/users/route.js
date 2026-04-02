import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Order from "@/models/Order";
import Course from "@/models/Course";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDb();

    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // fetch all orders so that admin can see which user purchased which course
    // include the whole user object except sensitive fields
    const orders = await Order.find()
        .populate("userId", "-password")
        .populate("courseId", "title slug")
        .sort({ createdAt: -1 });

    // map to a simpler structure for the front end
    const result = orders.map((o) => ({
        _id: o._id,
        user: o.userId,
        course: o.courseId,
        amount: o.amount,
        status: o.status,
        purchaseDate: o.createdAt,
    }));

    return NextResponse.json(result);
}