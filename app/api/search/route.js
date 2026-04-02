import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";

const BLOG_DIR = path.join(process.cwd(), "content");
const TUTORIAL_DIR = path.join(process.cwd(), "tutorial");

function includesTerm(value, term) {
  if (!value) return false;
  return String(value).toLowerCase().includes(term);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  // If no query, return empty results to avoid heavy listing.
  if (!q) {
    return NextResponse.json({ blogs: [], tutorials: [], courses: [] });
  }

  const blogFiles = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR, "utf-8").filter((file) => file.endsWith(".md"))
    : [];

  const blogs = blogFiles
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(fileContent);
      return {
        title: data.title,
        description: data.description,
        author: data.author,
        date: data.date,
        image: data.image,
        slug: data.slug || file.replace(".md", ""),
      };
    })
    .filter((blog) => {
      return (
        includesTerm(blog.title, q) ||
        includesTerm(blog.description, q) ||
        includesTerm(blog.author, q)
      );
    })
    .slice(0, 12);

  const tutorialFiles = fs.existsSync(TUTORIAL_DIR)
    ? fs.readdirSync(TUTORIAL_DIR, "utf-8").filter((file) => file.endsWith(".md"))
    : [];

  const tutorials = tutorialFiles
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(TUTORIAL_DIR, file), "utf-8");
      const { data } = matter(fileContent);
      return {
        title: data.title,
        description: data.description,
        icon: data.icon,
        slug: data.slug || file.replace(".md", ""),
        published: typeof data.published === "boolean" ? data.published : true,
      };
    })
    .filter((tutorial) => {
      return (
        includesTerm(tutorial.title, q) ||
        includesTerm(tutorial.description, q)
      );
    })
    .slice(0, 12);

  await connectDb();

  const courses = await Course.find({
    published: true,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    .select("title slug description thumbnail price")
    .limit(12);

  return NextResponse.json({ blogs, tutorials, courses });
}
