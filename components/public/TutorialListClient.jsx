"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPython,
  FaReact,
  FaJava,
} from "react-icons/fa";
import { SiC, SiCplusplus, SiPhp } from "react-icons/si";

const iconMap = {
  html: <FaHtml5 className="text-orange-500" />,
  css: <FaCss3Alt className="text-blue-500" />,
  js: <FaJs className="text-yellow-400" />,
  python: <FaPython className="text-yellow-300" />,
  react: <FaReact className="text-cyan-400" />,
  java: <FaJava className="text-red-400" />,
  c: <SiC className="text-blue-400" />,
  cpp: <SiCplusplus className="text-blue-300" />,
  php: <SiPhp className="text-indigo-400" />,
};

export default function TutorialListClient({ tutorials }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const filteredTutorials = useMemo(() => {
    const term = query.trim().toLowerCase();

    return tutorials
      .map((item) => ({
        ...item,
        published: typeof item.published === "boolean" ? item.published : true,
      }))
      .filter((item) => {
        if (!term) return true;
        return [item.title, item.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      });
  }, [tutorials, query]);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mb-10 space-y-4 text-center">
        <h1 className="text-4xl font-bold">Tutorials</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse curated tutorials and learn at your own pace.
        </p>
      </div>

      {filteredTutorials.length ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTutorials.map((item, index) => (
            <div
              key={`${item.slug}-${index}`}
              className="group flex h-full flex-col items-center rounded-xl border bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-5 text-6xl">{iconMap[item.icon]}</div>

              <h2 className="mb-5 text-xl font-semibold">{item.title}</h2>

              <p className="mb-6 line-clamp-3 text-sm">{item.description}</p>

              <Link
                href={`/tutorialpost/${item.slug}`}
                className="mt-auto inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Start Learning! →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-white/5 dark:text-slate-400">
          No tutorials match your search.
        </div>
      )}
    </div>
  );
}
