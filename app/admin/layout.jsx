import AdminNavbar from "@/components/admin/AdminNavbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  // ✅ Server-side check: Verify user is admin
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    // Redirect non-admin users to home page
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      {/* ✅ Admin-only navbar */}
      <AdminNavbar />

      {/* Admin page content */}
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
