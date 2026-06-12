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
  const nameError = form.formState.errors.name?.message;
  const emailError = form.formState.errors.email?.message;
  const subjectError = form.formState.errors.subject?.message;
  const messageError = form.formState.errors.message?.message;

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
          <span className="meta-label text-ink">Name</span>
          <input
            id="inquiry-name"
            {...form.register("name")}
            aria-describedby={nameError ? "inquiry-name-error" : undefined}
            aria-invalid={Boolean(nameError)}
            className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70 focus:border-ink"
            placeholder="Your name"
          />
          {nameError ? (
            <span id="inquiry-name-error" className="text-sm text-red-700">{nameError}</span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm text-fog">
          <span className="meta-label text-ink">Email</span>
          <input
            id="inquiry-email"
            {...form.register("email")}
            aria-describedby={emailError ? "inquiry-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70 focus:border-ink"
            placeholder="you@example.com"
          />
          {emailError ? (
            <span id="inquiry-email-error" className="text-sm text-red-700">{emailError}</span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-2 text-sm text-fog">
        <span className="meta-label text-ink">Subject</span>
        <input
          id="inquiry-subject"
          {...form.register("subject")}
          aria-describedby={subjectError ? "inquiry-subject-error" : undefined}
          aria-invalid={Boolean(subjectError)}
          className="border-b border-line bg-transparent px-0 py-3 text-base text-ink outline-none placeholder:text-fog/70 focus:border-ink"
        />
        {subjectError ? (
          <span id="inquiry-subject-error" className="text-sm text-red-700">{subjectError}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm text-fog">
        <span className="meta-label text-ink">Message</span>
        <textarea
          id="inquiry-message"
          {...form.register("message")}
          aria-describedby={messageError ? "inquiry-message-error" : undefined}
          aria-invalid={Boolean(messageError)}
          className="min-h-40 border border-line bg-transparent p-4 text-base text-ink outline-none placeholder:text-fog/70 focus:border-ink"
          placeholder="Sizing, availability, archive questions, or appointment context."
        />
        {messageError ? (
          <span id="inquiry-message-error" className="text-sm text-red-700">{messageError}</span>
        ) : null}
      </label>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          type="submit"
          disabled={submissionState === "submitting"}
          className="archive-link disabled:opacity-50"
        >
          {submissionState === "submitting" ? "Sending..." : "Send inquiry"}
        </button>

        {submissionMessage ? (
          <p
            role="status"
            aria-live="polite"
            className={submissionState === "error" ? "text-sm text-red-700" : "text-sm text-fog"}
          >
            {submissionMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
