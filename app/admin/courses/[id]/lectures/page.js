"use client";

import { useEffect, useState } from "react";
import { use } from "react";

export default function LecturesPage({ params }) {
  const { id: courseId } = use(params);

  const [lectures, setLectures] = useState([]);
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  /* ---------------- FETCH DATA ---------------- */

  const fetchLectures = async () => {
    try {
      const res = await fetch(`/api/admin/lectures?courseId=${courseId}`);
      if (res.status === 401) {
        setError("Unauthorized. Please login as admin.");
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch lectures: ${res.status}`);
      const data = await res.json();
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchLectures error:", err);
      setError("Could not load lectures.");
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch(`/api/admin/sections?courseId=${courseId}`);
      if (res.status === 401) {
        setError("Unauthorized. Please login as admin.");
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch sections: ${res.status}`);
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchSections error:", err);
      setError("Could not load sections.");
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchLectures();
      fetchSections();
    }
  }, [courseId]); // added courseId as dependency (was [] before — risky)

  /* ---------------- CREATE SECTION ---------------- */

  const createSection = async () => {
    if (!newSectionTitle.trim()) return;

    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSectionTitle,
          courseId,
          order: sections.length + 1,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Server error ${res.status}`);
      }

      setNewSectionTitle("");
      fetchSections();
    } catch (err) {
      console.error("createSection error:", err);
      alert(`Failed to create section: ${err.message}`);
    }
  };

  /* ---------------- DELETE LECTURE ---------------- */

  const deleteLecture = async (lectureId) => {
    if (!confirm("Delete this lecture?")) return;

    try {
      const res = await fetch(`/api/admin/lectures/${lectureId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Server error ${res.status}`);
      }

      fetchLectures();
    } catch (err) {
      console.error("deleteLecture error:", err);
      alert(`Failed to delete lecture: ${err.message}`);
    }
  };

  /* ---------------- UPLOAD LECTURE ---------------- */

  const submitLecture = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData(e.target);
      formData.append("courseId", courseId);

      const res = await fetch("/api/admin/lectures", {
        method: "POST",
        body: formData,

      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData?.message || `Upload failed with status ${res.status}`,
        );
      }

      e.target.reset();
      fetchLectures();
    } catch (err) {
      console.error("submitLecture error:", err);
      setUploadError(err.message || "Upload failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GROUP LECTURES ---------------- */

  const getLecturesForSection = (sectionId) =>
    lectures.filter((lec) => lec.sectionId === sectionId);

  const lecturesWithoutSection = lectures.filter((lec) => !lec.sectionId);

  /* ---------------- UI ---------------- */

return (
  <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-10">

    {/* PAGE TITLE */}
    <h1 className="text-2xl sm:text-3xl font-bold">
      Course Sections & Lectures
    </h1>

    {/* GLOBAL ERROR */}
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )}

    {/* ---------------- CREATE SECTION ---------------- */}

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-3">
      <h2 className="text-lg font-semibold">Create Section</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createSection()}
          placeholder="Section title"
          className="border border-slate-300 dark:border-slate-700 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          onClick={createSection}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg"
        >
          Add Section
        </button>
      </div>
    </div>

    {/* ---------------- UPLOAD LECTURE ---------------- */}

    <form
      onSubmit={submitLecture}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-4"
    >
      <h2 className="text-lg font-semibold">Upload Lecture</h2>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          ⚠️ {uploadError}
        </div>
      )}

      <input
        name="title"
        placeholder="Lecture title"
        className="border border-slate-300 dark:border-slate-700 p-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
        required
      />

      <input
        name="order"
        type="number"
        placeholder="Lecture order"
        className="border border-slate-300 dark:border-slate-700 p-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
        required
      />

      <select
        name="sectionId"
        className="border border-slate-300 dark:border-slate-700 p-2 rounded-lg w-full"
      >
        <option value="">No Section</option>
        {sections.map((sec) => (
          <option key={sec._id} value={sec._id}>
            {sec.order}. {sec.title}
          </option>
        ))}
      </select>

      <input
        name="video"
        type="file"
        accept="video/*"
        className="border border-slate-300 dark:border-slate-700 p-2 rounded-lg w-full"
        required
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPreview" value="true" />
        Free Preview
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-black hover:bg-slate-800 transition text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Lecture"}
      </button>
    </form>

    {/* ---------------- GENERAL LECTURES ---------------- */}

    {lecturesWithoutSection.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-3">General Lectures</h2>

        <div className="space-y-2">
          {lecturesWithoutSection.map((lec) => (
            <div
              key={lec._id}
              className="border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <div>
                {lec.order}. {lec.title}

                {lec.isPreview && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Preview
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteLecture(lec._id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ---------------- SECTIONS ---------------- */}

    {sections.map((section) => {
      const sectionLectures = getLecturesForSection(section._id);
      const isOpen = openSection === section._id;

      return (
        <div
          key={section._id}
          className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
        >

          {/* SECTION HEADER */}
          <div
            onClick={() => toggleSection(section._id)}
            className="flex justify-between items-center p-4 cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <h2 className="font-semibold">
              {section.order}. {section.title}
            </h2>

            <span className="text-sm">
              {isOpen ? "▲" : "▼"}
            </span>
          </div>

          {/* SECTION CONTENT */}
          {isOpen && (
            <div className="p-4 space-y-2">

              {sectionLectures.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No lectures in this section
                </p>
              ) : (
                sectionLectures.map((lec) => (
                  <div
                    key={lec._id}
                    className="border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <div>
                      {lec.order}. {lec.title}

                      {lec.isPreview && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Preview
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteLecture(lec._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}

            </div>
          )}
        </div>
      );
    })}
  </div>
);
}
