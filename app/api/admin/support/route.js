import connectDb from "@/db/connectDb";
import Support from "@/models/Support";

export async function GET(req) {
    await connectDb();

    const messages = await Support.find().sort({ createdAt: -1});

    return Response.json(messages);
}