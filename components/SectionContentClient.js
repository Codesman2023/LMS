"use client"
import React from 'react';

export default function SectionContentClient({ htmlContent }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      className="prose dark:prose-invert max-w-none"
    ></div>
  );
}
