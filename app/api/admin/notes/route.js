import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectDb from "@/db/connectDb";
import Note from "@/models/Note";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// 🔐 GET all notes
export async function GET() {
  await connectDb();
  const notes = await Note.find().sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

// 🔐 Upload note
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file");
  const title = data.get("title");
  const subject = data.get("subject");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/notes");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, buffer);

  await connectDb();
  await Note.create({
    title,
    subject,
    fileUrl: `/notes/${file.name}`,
  });

  return NextResponse.json({ success: true });
}

// 🔐 Delete note
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await connectDb();
  const note = await Note.findById(id);

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", note.fileUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await Note.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
