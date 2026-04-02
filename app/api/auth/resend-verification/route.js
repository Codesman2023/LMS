import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    await connectDb();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.tokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(email, token);

    return NextResponse.json(
      { success: true, message: "Verification email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to resend verification email" },
      { status: 500 },
    );
  }
}
