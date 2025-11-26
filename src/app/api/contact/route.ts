import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: email,
      to: "sacredmind2002@gmail.com",
      subject: `New Message from ${name}`,
      text: message, // fallback for plain text
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #6b21a8; text-align: center;">📩 New Contact Message</h2>
      <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
      <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
      <p style="margin-bottom: 20px;"><strong>Message:</strong></p>
      <p style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">${message.replace(
        /\n/g,
        "<br/>"
      )}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        This email was sent from your Thriftian contact form.
      </p>
    </div>
  `,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}
