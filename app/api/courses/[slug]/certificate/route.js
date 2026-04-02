import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Course from "@/models/Course";
import Order from "@/models/Order";
import CourseProgress from "@/models/CourseProgress";
import Lecture from "@/models/Lecture";
import { getCurrentUser } from "@/lib/auth";
import crypto from "node:crypto";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatIssueDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function splitIntoLines(value, maxLength = 28) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

function buildCertificateSvg({ studentName, courseTitle, issueDate, certificateId }) {
  const courseTitleLines = splitIntoLines(courseTitle, 26);
  const courseTitleMarkup = courseTitleLines
    .map((line, index) => {
      const y = 714 + index * 60;
      return `<text x="800" y="${y}" text-anchor="middle" fill="#0F3D2E" font-family="Georgia, serif" font-size="58" font-weight="700">${escapeXml(line)}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="1132" viewBox="0 0 1600 1132" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paper" x1="120" y1="90" x2="1480" y2="1042" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFDF7"/>
      <stop offset="1" stop-color="#F8F0E0"/>
    </linearGradient>
    <linearGradient id="frame" x1="68" y1="68" x2="1532" y2="1064" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E4C77B"/>
      <stop offset="0.5" stop-color="#B88A2E"/>
      <stop offset="1" stop-color="#F0D89C"/>
    </linearGradient>
    <linearGradient id="seal" x1="800" y1="118" x2="800" y2="274" gradientUnits="userSpaceOnUse">
      <stop stop-color="#214F3B"/>
      <stop offset="1" stop-color="#0D2E24"/>
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="#DFC98A" fill-opacity="0.35"/>
    </pattern>
    <filter id="shadow" x="0" y="0" width="1600" height="1132" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#7C5C24" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="1600" height="1132" fill="#EEE4D0"/>
  <rect width="1600" height="1132" fill="url(#dots)"/>
  <g filter="url(#shadow)">
    <rect x="20" y="34" width="1560" height="1064" rx="34" fill="url(#paper)"/>
  </g>
  <rect x="20" y="34" width="1560" height="1064" rx="34" stroke="#1E293B" stroke-width="3"/>
  <rect x="46" y="60" width="1508" height="1012" rx="26" stroke="url(#frame)" stroke-width="8"/>
  <rect x="74" y="88" width="1452" height="956" rx="18" fill="none" stroke="#D9BE7A" stroke-width="2" stroke-dasharray="10 12"/>
  <path d="M112 158C216 120 322 102 438 102H1162C1278 102 1384 120 1488 158" stroke="#C39A43" stroke-width="2" stroke-linecap="round"/>
  <path d="M112 974C216 1012 322 1030 438 1030H1162C1278 1030 1384 1012 1488 974" stroke="#C39A43" stroke-width="2" stroke-linecap="round"/>
  <path d="M258 238H1342" stroke="#D5B166" stroke-width="2" stroke-linecap="round"/>
  <path d="M258 872H1342" stroke="#D5B166" stroke-width="2" stroke-linecap="round"/>
  <circle cx="800" cy="196" r="78" fill="url(#seal)"/>
  <circle cx="800" cy="196" r="61" fill="none" stroke="#EED48B" stroke-width="2" stroke-dasharray="4 8"/>
  <text x="800" y="184" text-anchor="middle" fill="#F6E7BA" font-family="Georgia, serif" font-size="28" font-weight="700">BLOG WEB</text>
  <text x="800" y="218" text-anchor="middle" fill="#F6E7BA" font-family="Arial, sans-serif" font-size="15" letter-spacing="4">ACADEMY</text>
  <text x="800" y="324" text-anchor="middle" fill="#94702B" font-family="Arial, sans-serif" font-size="22" letter-spacing="10">CERTIFICATE OF COMPLETION</text>
  <text x="800" y="402" text-anchor="middle" fill="#111827" font-family="Georgia, serif" font-size="64" font-weight="700">Awarded To</text>
  <text x="800" y="512" text-anchor="middle" fill="#0F172A" font-family="Georgia, serif" font-size="88" font-weight="700">${escapeXml(studentName)}</text>
  <line x1="340" y1="548" x2="1260" y2="548" stroke="#BE9640" stroke-width="3"/>
  <text x="800" y="616" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-size="30">for successfully completing the certified course</text>
  ${courseTitleMarkup}
  <text x="800" y="832" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-size="26">Issued on ${escapeXml(issueDate)}</text>
  <path d="M216 886C298 836 386 812 490 812H1110C1214 812 1302 836 1384 886" stroke="#D2B06A" stroke-width="2" stroke-linecap="round"/>
  <line x1="200" y1="938" x2="600" y2="938" stroke="#243042" stroke-width="2"/>
  <line x1="1000" y1="938" x2="1400" y2="938" stroke="#243042" stroke-width="2"/>
  <text x="200" y="976" fill="#64748B" font-family="Arial, sans-serif" font-size="22">Certificate ID</text>
  <text x="200" y="1012" fill="#111827" font-family="Courier New, monospace" font-size="23">${escapeXml(certificateId)}</text>
  <text x="1000" y="976" fill="#64748B" font-family="Arial, sans-serif" font-size="22">Issued By</text>
  <text x="1000" y="1012" fill="#0F3D2E" font-family="Georgia, serif" font-size="34" font-weight="700">Blog Web Academy</text>
  <text x="1000" y="1042" fill="#475569" font-family="Arial, sans-serif" font-size="18">Professional Learning Certificate</text>
</svg>`;
}

export async function GET(req, { params }) {
  await connectDb();

  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Login required" }, { status: 401 });
  }

  const course = await Course.findOne({ slug, published: true }).select("title");
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const order = await Order.findOne({
    userId: user._id,
    courseId: course._id,
    status: "paid",
  }).select("_id");

  if (!order) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const totalLectures = await Lecture.countDocuments({ courseId: course._id });

  let progress = await CourseProgress.findOne({
    userId: user._id,
    courseId: course._id,
  });

  const completedLectures = progress?.completedLectureIds?.length || 0;
  const isCompleted = totalLectures > 0 && completedLectures >= totalLectures;

  if (!isCompleted) {
    return NextResponse.json(
      { message: "Complete the full course to unlock your certificate" },
      { status: 400 },
    );
  }

  if (!progress) {
    return NextResponse.json(
      { message: "Progress record not found for this course" },
      { status: 404 },
    );
  }

  if (!progress.certificateIssuedAt) {
    progress.certificateIssuedAt = new Date();
  }

  if (!progress.certificateId) {
    progress.certificateId = crypto.randomUUID();
  }

  if (progress.isModified()) {
    await progress.save();
  }

  const studentName = user.username || user.email;
  const issueDate = formatIssueDate(progress.certificateIssuedAt);
  const svg = buildCertificateSvg({
    studentName,
    courseTitle: course.title,
    issueDate,
    certificateId: progress.certificateId,
  });
  const safeSlug = course.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeSlug || "course"}-certificate.svg"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
