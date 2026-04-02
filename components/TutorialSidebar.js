"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const STORAGE_KEY = 'tutorial_sidebar_expanded';

const TutorialSidebar = ({ htmlContent }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const router = useRouter();
  const params = useParams();

  const getChapters = useCallback(() => {
    if (typeof window === "undefined" || !htmlContent) {
      return [];
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const h1Elements = tempDiv.querySelectorAll('h1');
    const chapters = [];

    h1Elements.forEach((h1) => {
      const chapter = {
        id: h1.id || '',
        title: h1.textContent || '',
        subtopics: []
      };

      let nextElement = h1.nextElementSibling;
      while (nextElement && nextElement.tagName !== 'H1') {
        if (nextElement.tagName === 'H2') {
          chapter.subtopics.push({
            id: nextElement.id || '',
            title: nextElement.textContent || ''
          });
        }
        nextElement = nextElement.nextElementSibling;
      }

      chapters.push(chapter);
    });

    return chapters;
  }, [htmlContent]);

  useEffect(() => {
    // initialize from localStorage only on component mount, not on every htmlContent change
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setExpandedChapters(JSON.parse(raw));
        return;
      }
    } catch (e) {}

    const chapters = getChapters();
    if (chapters.length > 0) setExpandedChapters({ 0: true });
  }, []); // empty dependency array - run only once on mount

  const persist = (next) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const toggleChapter = (index) => {
    setExpandedChapters(prev => {
      const next = { ...prev, [index]: !prev[index] };
      persist(next);
      return next;
    });
  };

  useEffect(() => {
    // auto-expand only the chapter that contains the current `params.section`, close all others
    const section = params?.section;
    if (!section) return;
    const chapters = getChapters();
    const normalize = (s) => (s || '').toString().toLowerCase();
    const target = normalize(decodeURIComponent(section));

    const foundIndex = chapters.findIndex((ch) => {
      if (normalize(ch.id) === target) return true;
      if (normalize(ch.title) === target) return true;
      return ch.subtopics.some((st) => normalize(st.id) === target || normalize(st.title) === target);
    });

    if (foundIndex !== -1) {
      // only expand the current chapter, close all others
      const next = { [foundIndex]: true };
      setExpandedChapters(next);
      persist(next);
    }
  }, [params?.section, getChapters]);

  const navigateToSection = (id, title) => {
    const slug = params?.slug;
    const sectionSlug = id || (title || '').toLowerCase().replace(/\s+/g, '-');
    if (!slug) return;
    router.push(`/tutorialpost/${slug}/${sectionSlug}`);
  };

  const chapters = getChapters();

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 flex flex-col">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 z-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contents</h2>
      </div>
      <nav className="space-y-2 p-4 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <div key={index}>
            <button
              onClick={() => toggleChapter(index)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-left text-gray-900 dark:text-gray-100 font-medium group"
            >
              <span className="flex-1">
                {chapter.title}
              </span>
              {chapter.subtopics.length > 0 && (
                <span className="ml-2">
                  {expandedChapters[index] ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </span>
              )}
            </button>

            {/* Subtopics Dropdown */}
            {expandedChapters[index] && chapter.subtopics.length > 0 && (
              <div className="ml-4 space-y-1 border-l border-gray-300 dark:border-gray-600 pl-3 mt-2">
                {chapter.subtopics.map((subtopic, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => navigateToSection(subtopic.id, subtopic.title)}
                    className="block w-full text-left px-3 py-1 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    {subtopic.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default React.memo(TutorialSidebar);
