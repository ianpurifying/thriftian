// app/api/email/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { emailService } from "@/lib/services/emailService";
import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email(),
  toName: z.string(),
  subject: z.string(),
  htmlContent: z.string(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await emailService.sendGenericEmail(
      validation.data.to,
      validation.data.toName,
      validation.data.subject,
      validation.data.htmlContent
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Email send error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
