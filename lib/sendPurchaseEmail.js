import nodemailer from "nodemailer";

export default async function sendPurchaseEmail({ to, userName, courseTitle, amount, orderId }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const amountText =
    typeof amount === "number" ? `INR ${amount.toFixed(2)}` : "INR";

  await transporter.sendMail({
    to,
    subject: "Your course purchase is confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Purchase confirmed</h2>
        <p>Hi ${userName || "there"},</p>
        <p>Thanks for your purchase! Your payment was successful.</p>
        <p><strong>Course:</strong> ${courseTitle || "Course access"}</p>
        <p><strong>Amount:</strong> ${amountText}</p>
        <p><strong>Order ID:</strong> ${orderId || "-"}</p>
        <p>You can now access the course from your dashboard.</p>
        <p>Happy learning!</p>
      </div>
    `,
  });
}
