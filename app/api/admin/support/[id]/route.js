import connectDb from "@/db/connectDb";
import Support from "@/models/Support";

export async function PATCH(request, { params }) {
  await connectDb();

  const { id } = params;

  if (!id) {
    return Response.json({ message: "Support request id is required" }, { status: 400 });
  }

  const updated = await Support.findByIdAndUpdate(
    id,
    { status: "resolved" },
    { new: true },
  );

  if (!updated) {
    return Response.json({ message: "Support request not found" }, { status: 404 });
  }

  return Response.json(updated);
}
