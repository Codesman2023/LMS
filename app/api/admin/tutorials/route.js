import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const TUTORIAL_DIR = path.join(process.cwd(), "tutorial");

// 🔹 GET – list tutorials
export async function GET() {
  const files = fs.readdirSync(TUTORIAL_DIR);

  const tutorials = files.map((file) => {
    const content = fs.readFileSync(
      path.join(TUTORIAL_DIR, file),
      "utf-8"
    );

    const title =
      content.match(/title:\s*(.*)/)?.[1] || file;

    return {
      slug: file.replace(".md", ""),
      title,
    };
  });

  return NextResponse.json(tutorials);
}

// 🔹 POST – create tutorial
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, content, icon } = await req.json();

  const slug = title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-") // remove +, &, etc
  .replace(/^-+|-+$/g, "");   // trim hyphens
  const today = new Date().toISOString().split("T")[0];

  const fileContent = `---
title: ${title}
description: "${description}"
slug: ${slug}
date: "${today}"
author: "MY-LMS"
icon: "${icon || "FaBook"}"
published: true
---

${content}
`;

  fs.writeFileSync(
    path.join(TUTORIAL_DIR, `${slug}.md`),
    fileContent
  );

  return NextResponse.json({ success: true });
}

// 🔹 DELETE – delete tutorial
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let slug = searchParams.get("slug");

  // Helper to sanitize slug (same as POST)
  const sanitizeSlug = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Try exact slug first
  let filePath = path.join(TUTORIAL_DIR, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  }

  // Try sanitized slug
  const sanitized = sanitizeSlug(slug);
  filePath = path.join(TUTORIAL_DIR, `${sanitized}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  }

  // Try replacing spaces with + (URL decode reversal for '+' -> ' ' issue)
  const withPlus = slug.replace(/ /g, "+");
  filePath = path.join(TUTORIAL_DIR, `${withPlus}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
