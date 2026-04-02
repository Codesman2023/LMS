import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

// 🔹 GET profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDb();

  const user = await User.findById(session.user.id).select("-password");
  return NextResponse.json(user);
}

// 🔹 UPDATE profile
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  await connectDb();

  await User.findByIdAndUpdate(
    session.user.id,
    {
      username: data.name, // ✅ FIX
      mobile: data.mobile,
      country: data.country,
      state: data.state,
      city: data.city,
      pincode: data.pincode,
      dob: data.dob,
      gender: data.gender,
    },
    { new: true }
  );

  return NextResponse.json({ success: true });
}
