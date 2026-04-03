// app/notes/page.jsx
import connectDb from "@/db/connectDb";
import Note from "@/models/Note";
import Link from "next/link";
import { FileText, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  await connectDb();
  const notes = await Note.find().lean();
 return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Notes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="group flex flex-col h-full border dark:border-white/10 rounded-xl p-5 
                       bg-white dark:bg-white/5 shadow-md hover:shadow-xl 
                       transition-all duration-300 hover:-translate-y-1"
          >
            {/* PDF Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <FileText size={28} />
              </div>

              <div>
                <h2 className="font-semibold text-lg line-clamp-1">
                  {note.title}
                </h2>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                  {note.subject}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <Link
              href={note.fileUrl}
              download
              className="mt-auto inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium 
                         hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black 
                         transition"
            >
              <Download size={16} />
              Download PDF
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
