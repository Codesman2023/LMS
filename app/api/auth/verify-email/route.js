import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    await connectDb();

    const user = await User.findOne({
      verificationToken: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.tokenExpiry = null;

    await user.save();

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?verified=true`
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}