import { Suspense } from "react";
import fs from "fs";
import matter from "gray-matter";
import TutorialListClient from "@/components/public/TutorialListClient";

export const dynamic = "force-dynamic";

const dirTutorial = fs.readdirSync("tutorial", "utf-8");

const tutorials = dirTutorial.map((file) => {
  const tutorialContent = fs.readFileSync(`tutorial/${file}`, "utf-8");
  const { data } = matter(tutorialContent);
  return {
    ...data,
    slug: data.slug || file.replace(".md", ""),
  };
});

const Page = () => {
  return (
    <Suspense fallback={<div>Loading tutorials...</div>}>
      <TutorialListClient tutorials={tutorials} />
    </Suspense>
  );
};

export default Page;
