import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const BLOG_DIR = path.join(process.cwd(), "content");

// 🔹 GET – load blog for editing
export async function GET(req, { params }) {
  const { slug } = await params;
  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(file);

  return NextResponse.json({
    ...data,
    content,
  });
}

// 🔹 PUT – update blog
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  const {
    title,
    description,
    content,
    image,
    published,
  } = await req.json();

  const today = new Date().toISOString().split("T")[0];

  const updatedFile = `---
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

  fs.writeFileSync(filePath, updatedFile);

  return NextResponse.json({ success: true });
}
