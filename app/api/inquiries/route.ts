import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { mutateAdmin } from "@/lib/convex-admin";
import type { InquiryItemInput, InquirySourceType, PublicInquiryPayload } from "@/lib/inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inquiryTypeSchema = z.enum(["general", "product", "rfq"]);
const sourceTypeSchema = z.enum(["category", "family", "product", "article", "general"]);
const inquiryItemSchema = z.object({
  productId: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive().max(1_000_000),
  notes: z.string().trim().max(500).optional(),
});

const inquiryPayloadSchema = z
  .object({
    type: inquiryTypeSchema,
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    replyTo: z.string().trim().email().max(200).optional(),
    company: z.string().trim().max(160).optional(),
    country: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(60).optional(),
    message: z.string().trim().max(4000).optional(),
    sourceType: sourceTypeSchema.optional(),
    sourceId: z.string().trim().max(128).optional(),
    sourcePage: z.string().trim().max(260).optional(),
    productName: z.string().trim().max(240).optional(),
    attachmentName: z.string().trim().max(500).optional(),
    items: z.array(inquiryItemSchema).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== "rfq" && !value.message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Message is required.",
      });
    }
    if (value.type === "rfq" && (!value.items || value.items.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one RFQ item is required.",
      });
    }
  });

type NormalizedInquiryPayload = PublicInquiryPayload & {
  type: "general" | "product" | "rfq";
  name: string;
  email: string;
  replyTo?: string;
  sourceType?: InquirySourceType;
  items?: InquiryItemInput[];
};

type InquiryAttachment = {
  field: "drawing" | "bom";
  label: string;
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
};

type AttachmentConfig = {
  field: "drawing" | "bom";
  label: string;
  allowedExtensions: string[];
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
  cc?: string;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const ATTACHMENT_CONFIGS: AttachmentConfig[] = [
  {
    field: "drawing",
    label: "Drawing",
    allowedExtensions: [".pdf", ".dwg", ".dxf", ".step", ".stp", ".igs", ".iges", ".jpg", ".jpeg", ".png"],
  },
  {
    field: "bom",
    label: "BOM",
    allowedExtensions: [".xlsx", ".xls", ".csv", ".pdf"],
  },
];

function toOptionalString(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function getSmtpConfig(): SmtpConfig {
  const host = toOptionalString(process.env.SMTP_HOST);
  const user = toOptionalString(process.env.SMTP_USER);
  const pass = toOptionalString(process.env.SMTP_PASS);
  const to = toOptionalString(process.env.SMTP_TO);
  const from = toOptionalString(process.env.SMTP_FROM);
  const cc = toOptionalString(process.env.SMTP_CC);
  const rawPort = toOptionalString(process.env.SMTP_PORT) ?? "465";
  const port = Number(rawPort);

  if (!host || !user || !pass || !to) {
    throw new Error("SMTP config incomplete. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_TO.");
  }

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid SMTP_PORT: ${rawPort}`);
  }

  return {
    host,
    port,
    secure: parseBoolean(process.env.SMTP_SECURE, port === 465),
    user,
    pass,
    to,
    cc,
    from: from ?? user,
  };
}

function buildRfqItemsText(items: InquiryItemInput[] | undefined) {
  if (!items || items.length === 0) return "";
  return items
    .map(
      (item, index) =>
        `${index + 1}. Product: ${item.productId}; Quantity: ${item.quantity}; Notes: ${
          item.notes && item.notes.length > 0 ? item.notes : "N/A"
        }`
    )
    .join("\n");
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function buildAttachmentSummary(attachments: InquiryAttachment[]) {
  if (attachments.length === 0) return "";
  return attachments
    .map((attachment) => `${attachment.label}: ${attachment.filename} (${formatBytes(attachment.size)})`)
    .join("\n");
}

function buildStoredMessage(
  payload: NormalizedInquiryPayload,
  attachments: InquiryAttachment[] = []
) {
  const baseMessage = payload.message ?? "";
  const productLine = payload.productName ? `Product: ${payload.productName}` : "";
  const attachmentSummary = buildAttachmentSummary(attachments);
  const attachmentSection = attachmentSummary ? `Attachments:\n${attachmentSummary}` : "";

  if (payload.type !== "rfq") {
    return [productLine, baseMessage, attachmentSection].filter((part) => part.length > 0).join("\n\n");
  }

  const sections = [productLine, baseMessage, "RFQ Items:", buildRfqItemsText(payload.items), attachmentSection].filter(
    (part) => part.length > 0
  );
  return sections.join("\n\n");
}

function buildEmailText(
  payload: NormalizedInquiryPayload,
  request: Request,
  finalMessage: string,
  attachments: InquiryAttachment[] = []
) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "N/A";
  const userAgent = request.headers.get("user-agent") ?? "N/A";
  const submittedAt = new Date().toISOString();
  const attachmentSummary = buildAttachmentSummary(attachments);

  return [
    "New inquiry received",
    "",
    `Type: ${payload.type}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Reply-To: ${payload.replyTo ?? payload.email}`,
    `Company: ${payload.company ?? "N/A"}`,
    `Country: ${payload.country ?? "N/A"}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Product: ${payload.productName ?? "N/A"}`,
    `Source Type: ${payload.sourceType ?? "N/A"}`,
    `Source ID: ${payload.sourceId ?? "N/A"}`,
    `Source Page: ${payload.sourcePage ?? "N/A"}`,
    `Attachments: ${attachmentSummary || payload.attachmentName || "N/A"}`,
    `Submitted At (UTC): ${submittedAt}`,
    `IP: ${ip}`,
    `User Agent: ${userAgent}`,
    "",
    "Message:",
    finalMessage || "N/A",
  ].join("\n");
}

function normalizePayload(raw: z.infer<typeof inquiryPayloadSchema>): NormalizedInquiryPayload {
  return {
    ...raw,
    replyTo: toOptionalString(raw.replyTo),
    company: toOptionalString(raw.company),
    country: toOptionalString(raw.country),
    phone: toOptionalString(raw.phone),
    message: toOptionalString(raw.message),
    sourceType: raw.sourceType,
    sourceId: toOptionalString(raw.sourceId),
    sourcePage: toOptionalString(raw.sourcePage),
    productName: toOptionalString(raw.productName),
    attachmentName: toOptionalString(raw.attachmentName),
    items: raw.items?.map((item) => ({
      productId: item.productId.trim(),
      quantity: item.quantity,
      notes: toOptionalString(item.notes),
    })),
  };
}

async function saveInquiryToConvex(payload: NormalizedInquiryPayload, finalMessage: string) {
  try {
    await mutateAdmin("mutations/admin/inquiries:createInquiry", {
      type: payload.type,
      name: payload.name,
      email: payload.email,
      company: payload.company,
      country: payload.country,
      phone: payload.phone,
      message: finalMessage,
      sourcePage: payload.sourcePage,
      sourceType: payload.sourceType === "general" ? undefined : payload.sourceType,
      sourceId: payload.sourceType === "general" ? undefined : payload.sourceId,
      items: payload.items?.map((item) => ({
        sku: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      })),
    });
  } catch (error) {
    console.error("Failed to persist inquiry to Convex:", error);
  }
}

async function sendInquiryEmail(
  payload: NormalizedInquiryPayload,
  request: Request,
  finalMessage: string,
  attachments: InquiryAttachment[] = []
) {
  const smtp = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const subject = `[${payload.type.toUpperCase()}] Inquiry from ${payload.name}`;
  const text = buildEmailText(payload, request, finalMessage, attachments);

  await transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    cc: smtp.cc,
    replyTo: payload.replyTo ?? payload.email,
    subject,
    text,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    })),
  });
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value
  );
}

function sanitizeFilename(filename: string) {
  const cleanName = filename
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\u0000-\u001F<>:"|?*]/g, "_")
    .trim();

  return cleanName && cleanName.length > 0 ? cleanName.slice(0, 180) : "attachment";
}

function getFileExtension(filename: string) {
  const normalizedName = filename.toLowerCase();
  const dotIndex = normalizedName.lastIndexOf(".");
  return dotIndex >= 0 ? normalizedName.slice(dotIndex) : "";
}

async function getInquiryAttachments(formData: FormData) {
  const attachments: InquiryAttachment[] = [];
  let totalSize = 0;

  for (const config of ATTACHMENT_CONFIGS) {
    const value = formData.get(config.field);
    if (!isUploadedFile(value)) continue;

    if (value.size <= 0) {
      throw new Error(`${config.label} file is empty.`);
    }

    if (value.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`${config.label} file must be 10 MB or smaller.`);
    }

    const filename = sanitizeFilename(value.name);
    const extension = getFileExtension(filename);
    if (!config.allowedExtensions.includes(extension)) {
      throw new Error(`${config.label} file type is not supported.`);
    }

    totalSize += value.size;
    if (totalSize > MAX_TOTAL_ATTACHMENT_BYTES) {
      throw new Error("Attached files must be 20 MB or smaller in total.");
    }

    attachments.push({
      field: config.field,
      label: config.label,
      filename,
      contentType: value.type || "application/octet-stream",
      size: value.size,
      content: Buffer.from(await value.arrayBuffer()),
    });
  }

  return attachments;
}

async function parseMultipartInquiry(request: Request) {
  const formData = await request.formData();
  const attachments = await getInquiryAttachments(formData);
  const email = getFormString(formData, "email") ?? "";
  const company = getFormString(formData, "company");
  const attachmentName = attachments.map((attachment) => attachment.filename).join(", ");
  const rawPayload = {
    type: getFormString(formData, "type") ?? "product",
    name: getFormString(formData, "name") ?? company ?? email,
    email,
    replyTo: getFormString(formData, "replyTo") ?? email,
    company,
    country: getFormString(formData, "country"),
    phone: getFormString(formData, "phone"),
    message: getFormString(formData, "message"),
    sourceType: getFormString(formData, "sourceType"),
    sourceId: getFormString(formData, "sourceId"),
    sourcePage: getFormString(formData, "sourcePage"),
    productName: getFormString(formData, "productName"),
    attachmentName: attachmentName.length > 0 ? attachmentName : undefined,
  };

  return { rawPayload, attachments };
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  let attachments: InquiryAttachment[] = [];

  if (contentType.includes("multipart/form-data")) {
    try {
      const multipart = await parseMultipartInquiry(request);
      body = multipart.rawPayload;
      attachments = multipart.attachments;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid form payload.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
  }

  const parsed = inquiryPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Invalid inquiry payload." },
      { status: 400 }
    );
  }

  const payload = normalizePayload(parsed.data);
  const finalMessage = buildStoredMessage(payload, attachments);

  try {
    await sendInquiryEmail(payload, request, finalMessage, attachments);
  } catch (error) {
    console.error("Failed to send inquiry email:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry email. Please try again later." },
      { status: 500 }
    );
  }

  await saveInquiryToConvex(payload, finalMessage);

  return NextResponse.json({ ok: true }, { status: 200 });
}
