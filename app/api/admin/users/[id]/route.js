import { NextResponse } from "next/server";
import dbConnect from "@/db/connectDb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: body.isBlocked },
      { new: true }
    );

    return NextResponse.json({
      message: "User status updated",
      user,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}
