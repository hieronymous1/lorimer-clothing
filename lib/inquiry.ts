import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters."),
  message: z.string().trim().min(20, "Message must be at least 20 characters."),
  productSlug: z.string().trim().optional(),
  productTitle: z.string().trim().optional()
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export function buildInquirySubject(input: InquiryInput) {
  if (input.productTitle) {
    return `Lorimer inquiry: ${input.productTitle}`;
  }

  return input.subject;
}

export function buildInquiryText(input: InquiryInput) {
  return [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.productSlug ? `Product slug: ${input.productSlug}` : null,
    input.productTitle ? `Product title: ${input.productTitle}` : null,
    "",
    input.message
  ]
    .filter(Boolean)
    .join("\n");
}
