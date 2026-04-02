import connectDb from "@/db/connectDb";
import Support from "@/models/Support";

export async function POST(req) {
  await connectDb();

  const body = await req.json();

  const message = await Support.create(body);

  return Response.json({
    success: true,
    message: "Support request submitted",
    data: message,
  });
}
