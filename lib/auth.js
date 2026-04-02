import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/db/connectDb";
import User from "@/models/User";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
