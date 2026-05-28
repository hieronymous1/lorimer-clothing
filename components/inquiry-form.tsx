"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { inquirySchema, type InquiryInput } from "@/lib/inquiry";

type InquiryFormProps = {
  defaultSubject: string;
  productSlug?: string;
  productTitle?: string;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function InquiryForm({
  defaultSubject,
  productSlug,
  productTitle
}: InquiryFormProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      subject: defaultSubject,
      message: "",
      productSlug,
      productTitle
    }
  });

  async function onSubmit(values: InquiryInput) {
    setSubmissionState("submitting");
    setSubmissionMessage("");

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSubmissionState("error");
      setSubmissionMessage(payload.message || "Unable to send inquiry.");
      return;
    }

    setSubmissionState("success");
    setSubmissionMessage(
      payload.message || "Inquiry received. The studio will respond directly."
    );
    form.reset({
      name: "",
      email: "",
      subject: defaultSubject,
      message: "",
      productSlug,
      productTitle
    });
  }

  return (
    <form
      id="inquiry-form"
      className="grid gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <input type="hidden" {...form.register("productSlug")} />
      <input type="hidden" {...form.register("productTitle")} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-fog">
          <span className="text-[0.74rem] uppercase tracking-[0.18em] text-ink">Name</span>
          <input
            {...form.register("name")}
            className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70"
            placeholder="Your name"
          />
          {form.formState.errors.name ? (
            <span className="text-sm text-red-700">{form.formState.errors.name.message}</span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm text-fog">
          <span className="text-[0.74rem] uppercase tracking-[0.18em] text-ink">Email</span>
          <input
            {...form.register("email")}
            className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70"
            placeholder="you@example.com"
          />
          {form.formState.errors.email ? (
            <span className="text-sm text-red-700">{form.formState.errors.email.message}</span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-2 text-sm text-fog">
        <span className="text-[0.74rem] uppercase tracking-[0.18em] text-ink">Subject</span>
        <input
          {...form.register("subject")}
          className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70"
        />
        {form.formState.errors.subject ? (
          <span className="text-sm text-red-700">{form.formState.errors.subject.message}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm text-fog">
        <span className="text-[0.74rem] uppercase tracking-[0.18em] text-ink">Message</span>
        <textarea
          {...form.register("message")}
          className="min-h-40 border border-line bg-transparent p-4 text-base text-ink outline-none placeholder:text-fog/70"
          placeholder="Sizing, availability, archive questions, or appointment context."
        />
        {form.formState.errors.message ? (
          <span className="text-sm text-red-700">{form.formState.errors.message.message}</span>
        ) : null}
      </label>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          type="submit"
          disabled={submissionState === "submitting"}
          className="inline-flex w-fit border-b border-ink pb-1 text-[0.82rem] uppercase tracking-[0.18em] text-ink transition hover:opacity-70 disabled:opacity-50"
        >
          {submissionState === "submitting" ? "Sending..." : "Send inquiry"}
        </button>

        {submissionMessage ? (
          <p
            className={submissionState === "error" ? "text-sm text-red-700" : "text-sm text-fog"}
          >
            {submissionMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
