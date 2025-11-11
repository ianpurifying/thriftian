// app/api/webhooks/mailersend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get("x-mailersend-signature");
    const body = await req.text();

    if (process.env.MAILERSEND_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.MAILERSEND_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);

    // Log email event to Firestore
    await adminDb.collection("emailLogs").add({
      type: event.type,
      email: event.email,
      messageId: event.message_id,
      timestamp: new Date(event.timestamp * 1000),
      metadata: event,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Webhook processing error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
