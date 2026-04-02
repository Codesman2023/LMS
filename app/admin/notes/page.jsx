"use client";

import { useEffect, useState } from "react";

export default function AdminNotesPage() {
  const [notes, setNotes] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all notes
  async function fetchNotes() {
    const res = await fetch("/api/admin/notes");
    const data = await res.json();
    setNotes(data);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  // 🔹 Upload note
  async function handleUpload(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("subject", subject);

    await fetch("/api/admin/notes", {
      method: "POST",
      body: formData,
    });

    setTitle("");
    setSubject("");
    setFile(null);

    await fetchNotes(); // 👈 instant refresh
    setLoading(false);
  }

  // 🔹 Delete note
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    await fetch(`/api/admin/notes?id=${id}`, {
      method: "DELETE",
    });

    await fetchNotes(); // 👈 instant refresh
  }

return (
  <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-10">

    {/* Page Title */}
    <h1 className="text-2xl sm:text-3xl font-bold">
      Manage Notes
    </h1>

    {/* Upload Form Card */}
    <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-xl shadow-sm p-6 max-w-lg">

      <h2 className="text-lg font-semibold mb-4">
        Upload New Notes
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">

        {/* Title */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Title
          </label>
          <input
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Subject
          </label>
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-transparent p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Upload PDF
          </label>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm border border-slate-300 dark:border-slate-700 rounded p-2 file:bg-black file:text-white file:px-3 file:py-1 file:border-0 file:mr-3"
            required
          />
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full bg-black hover:bg-slate-800 transition text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>

      </form>
    </div>

    {/* Notes List */}
    <div>

      <h2 className="text-xl font-semibold mb-4">
        Uploaded Notes
      </h2>

      {notes.length === 0 ? (
        <p className="text-slate-500">No notes uploaded yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {notes.map((note) => (
            <div
              key={note._id}
              className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold">
                  {note.title}
                </p>
                <p className="text-sm text-slate-500">
                  {note.subject}
                </p>
              </div>

              <button
                onClick={() => handleDelete(note._id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}

        </div>
      )}
    </div>

  </div>
);
}