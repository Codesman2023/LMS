import fs from "fs";
import matter from "gray-matter";
import BlogListClient from "@/components/public/BlogListClient";

const dirContent = fs.readdirSync("content", "utf-8");

const blogs = dirContent.map((file) => {
  const fileContent = fs.readFileSync(`content/${file}`, "utf-8");
  const { data } = matter(fileContent);
  return {
    ...data,
    slug: data.slug || file.replace(".md", ""),
  };
});

const Blog = () => {
  return <BlogListClient blogs={blogs} />;
};

export default Blog;
