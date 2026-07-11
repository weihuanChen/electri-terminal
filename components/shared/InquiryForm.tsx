"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { FileUp, X } from "lucide-react";
import { submitPublicInquiry } from "@/lib/inquiry-client";
import { resourcesUrl } from "@/lib/routes";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/config";

interface InquiryFormProps {
  sourceType?: "category" | "family" | "product" | "article" | "general";
  sourceId?: string;
  productName?: string;
}

export default function InquiryForm({
  sourceType = "general",
  sourceId,
  productName,
}: InquiryFormProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("inquiry");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    company: "",
    message: "",
  });
  const [attachments, setAttachments] = useState<{
    drawing: File | null;
    bom: File | null;
  }>({
    drawing: null,
    bom: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "drawing" | "bom"
  ) => {
    setAttachments((prev) => ({ ...prev, [field]: e.target.files?.[0] ?? null }));
  };

  const removeFile = (field: "drawing" | "bom") => {
    setAttachments((prev) => ({ ...prev, [field]: null }));
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.message.trim()) {
      toast.error(t("requiredFields"));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append("type", sourceType === "general" ? "general" : "product");
      payload.append("email", formData.email.trim());
      payload.append("replyTo", formData.email.trim());
      payload.append("name", formData.company.trim() || formData.email.trim());
      payload.append("company", formData.company.trim());
      payload.append("message", formData.message.trim());
      payload.append("sourceType", sourceType);
      payload.append("sourcePage", window.location.pathname);
      if (sourceId) payload.append("sourceId", sourceId);
      if (productName) payload.append("productName", productName);
      if (attachments.drawing) payload.append("drawing", attachments.drawing);
      if (attachments.bom) payload.append("bom", attachments.bom);

      await submitPublicInquiry(payload);

      toast.success(t("success"));
      setFormData({
        email: "",
        company: "",
        message: "",
      });
      setAttachments({ drawing: null, bom: null });
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      const message =
        error instanceof Error ? error.message : t("failure");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-secondary mt-1">
          {t("intro")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              {t("company")}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder={t("companyPlaceholder")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            {t("message")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-vertical"
            placeholder={
              productName
                ? t("productMessagePlaceholder", { productName })
                : t("messagePlaceholder")
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(["drawing", "bom"] as const).map((field) => {
            const file = attachments[field];
            const label = field === "drawing" ? t("attachDrawing") : t("attachBom");

            return (
              <div key={field} className="rounded-sm border border-border bg-muted/40 p-3">
                <label
                  htmlFor={`rfq-${field}`}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <FileUp className="h-4 w-4" />
                  {label}
                </label>
                <input
                  key={file ? `${file.name}-${file.size}` : "empty"}
                  id={`rfq-${field}`}
                  name={field}
                  type="file"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e, field)}
                  accept={
                    field === "drawing"
                      ? ".pdf,.dwg,.dxf,.step,.stp,.igs,.iges,.jpg,.jpeg,.png"
                      : ".xlsx,.xls,.csv,.pdf"
                  }
                />
                {file && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-secondary">
                    <span className="min-w-0 truncate">
                      {file.name} · {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(field)}
                      className="shrink-0 text-secondary transition-colors hover:text-red-600"
                      aria-label={t("removeAttachment", { label })}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? t("submitting") : t("sendInquiry")}
        </button>

        <p className="text-xs text-secondary text-center">
          {t("agreementPrefix")}{" "}
          <Link href={resourcesUrl({ locale })} className="text-primary hover:underline">
            {t("documentationPolicy")}
          </Link>
        </p>
      </form>
    </div>
  );
}
