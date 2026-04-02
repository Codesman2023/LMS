import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import crypto from "crypto";
import sendEmail from "@/lib/sendEmail";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        },
        { status: 400 },
      );
    }

    await connectDb();

    const token = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure `username` is provided because the User schema requires it
    // Derive a simple username from the `name` (fallback to email local-part)
    const username = name
      ? name.replace(/\s+/g, "").toLowerCase()
      : (email && email.split("@")[0]) || "user" + Date.now();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 },
        );
      }

      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.verificationToken = token;
      existingUser.tokenExpiry = Date.now() + 10 * 60 * 1000;

      await existingUser.save();

      try {
        await sendEmail(email, token);
      } catch (emailError) {
        console.error("Email resend failed for unverified user:", emailError);
      }

      return NextResponse.json(
        {
          success: true,
          email,
          message:
            "Your account already exists but is not verified. We sent a new verification email.",
        },
        { status: 200 },
      );
    }

    await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user",

      // ✅ new fields
      isVerified: false,
      verificationToken: token,
      tokenExpiry: Date.now() + 10 * 60 * 1000, // 10 min
    });

    // ✅ send email
    try {
      await sendEmail(email, token);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
