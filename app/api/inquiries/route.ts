import { NextResponse } from "next/server";
import { Resend } from "resend";

import { buildInquirySubject, buildInquiryText, inquirySchema } from "@/lib/inquiry";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid inquiry payload.",
        errors: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL;

  if (resendKey && from && to) {
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from,
      to,
      replyTo: input.email,
      subject: buildInquirySubject(input),
      text: buildInquiryText(input)
    });

    return NextResponse.json({
      message: "Inquiry sent. The studio will reply directly."
    });
  }

  console.info("Lorimer inquiry received without Resend configuration.", input);

  return NextResponse.json(
    {
      message:
        "Inquiry captured locally. Add Resend environment variables to enable studio delivery."
    },
    { status: 202 }
  );
}
