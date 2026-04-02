import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const BLOG_DIR = path.join(process.cwd(), "content");

export async function GET() {
  const files = fs.readdirSync(BLOG_DIR);

  const blogs = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(fileContent);

      return {
        slug: file.replace(".md", ""),
        title: data.title || file.replace(".md", ""),
        description: data.description || "",
        image: data.image || "/blog.webp",
        date: data.date || null,
        published: typeof data.published === "boolean" ? data.published : true,
      };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return NextResponse.json(blogs);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title,
    description = "",
    content,
    image = "/blog.webp",
    published = true,
  } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 },
    );
  }

  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const today = new Date().toISOString().split("T")[0];
  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "A blog with this slug already exists" },
      { status: 409 },
    );
  }

  const fileContent = `---
title: ${title}
description: "${description}"
slug: ${slug}
date: "${today}"
author: "MY-LMS"
image: "${image}"
published: ${published}
---

${content}
`;

  fs.writeFileSync(filePath, fileContent);

  return NextResponse.json({ success: true, slug });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Blog slug is required" }, { status: 400 });
  }

  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);

  return NextResponse.json({ success: true });
}
