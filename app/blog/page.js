import fs from "fs";
import path from "path";
import matter from "gray-matter";
import BlogListClient from "@/components/public/BlogListClient";

function getBlogs() {
  const contentDir = path.join(process.cwd(), "content");

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  return fs
    .readdirSync(contentDir, "utf-8")
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        ...data,
        image: data.image || "/blog.webp",
        slug: data.slug || file.replace(/\.md$/, ""),
      };
    });
}

export default function Blog() {
  const blogs = getBlogs();
  return <BlogListClient blogs={blogs} />;
}
