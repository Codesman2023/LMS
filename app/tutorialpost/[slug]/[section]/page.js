import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";
import OnThisPage from "@/components/onthispage";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import React from "react";
import rehypeSlug from "rehype-slug";
import TutorialSidebar from "@/components/TutorialSidebar";
import SectionContentClient from "@/components/SectionContentClient";
import remarkGfm from "remark-gfm";

export default async function Page({ params }) {
  const { slug, section } = await params;
  const filepath = `tutorial/${slug}.md`;

  if (!fs.existsSync(filepath)) {
    notFound();
    return;
  }

  const fileContent = fs.readFileSync(filepath, "utf-8");
  const { content, data } = matter(fileContent);

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDocument, { title: "👋🌍" })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .use(remarkGfm)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypePrettyCode, {
      theme: "github-dark",
      transformers: [
        transformerCopyButton({
          visibility: "always",
          feedbackDuration: 3_000,
        }),
      ],
    });

  const htmlContent = (await processor.process(content)).toString();

  // extract only the requested section's HTML (heading + content until next heading of same or higher level)
  function extractSection(html, sectionId) {
    if (!sectionId) return null;
    const idVariants = [sectionId, decodeURIComponent(sectionId), sectionId.toLowerCase(), sectionId.replace(/\s+/g, '-').toLowerCase()];
    let foundIndex = -1;
    let matchId = null;
    for (const id of idVariants) {
      if (!id) continue;
      const idx = html.indexOf(`id="${id}"`);
      if (idx !== -1) {
        foundIndex = idx;
        matchId = id;
        break;
      }
    }
    if (foundIndex === -1) return null;

    // find start tag position
    const startTagOpen = html.lastIndexOf('<', foundIndex);
    const startTagMatch = html.slice(startTagOpen, startTagOpen + 10).match(/^<h([1-6])/i);
    const level = startTagMatch ? parseInt(startTagMatch[1], 10) : 2;

    // find end index by searching for next heading of same or higher level
    let searchIndex = startTagOpen + 1;
    let endIndex = html.length;
    while (true) {
      const next = html.indexOf('<h', searchIndex);
      if (next === -1) break;
      const m = html.slice(next, next + 10).match(/^<h([1-6])/i);
      if (m) {
        const nextLevel = parseInt(m[1], 10);
        if (nextLevel <= level && next > startTagOpen) {
          endIndex = next;
          break;
        }
      }
      searchIndex = next + 1;
    }

    return html.slice(startTagOpen, endIndex);
  }

  const sectionHtml = extractSection(htmlContent, section);
  if (!sectionHtml) {
    // if not found, show full content as fallback
    return (
      <div className="flex">
        <TutorialSidebar htmlContent={htmlContent} />
        <div className="max-w-7xl mx-20 p-4">
          <SectionContentClient htmlContent={htmlContent} section={section} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <TutorialSidebar htmlContent={htmlContent} />
      <div className="max-w-7xl mx-20 p-4">
        <SectionContentClient htmlContent={sectionHtml} section={section} />
      </div>
    </div>
  );
}
