"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { submitPublicInquiry } from "@/lib/inquiry-client";

type CertificateType = "CE" | "RoHS" | "REACH" | "Other";

const certificateOptions: CertificateType[] = ["CE", "RoHS", "REACH", "Other"];

export default function ComplianceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    country: "",
    requiredProduct: "",
    requiredCertificate: "CE" as CertificateType,
    message: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.company ||
      !formData.email ||
      !formData.country ||
      !formData.requiredProduct
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const compiledMessage = [
      "Compliance document request",
      `Required Product: ${formData.requiredProduct}`,
      `Required Certificate: ${formData.requiredCertificate}`,
      formData.message ? `Message: ${formData.message}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      setIsSubmitting(true);
      await submitPublicInquiry({
        type: "general",
        name: formData.name,
        company: formData.company,
        email: formData.email,
        country: formData.country,
        replyTo: formData.email,
        message: compiledMessage,
        sourceType: "general",
        sourcePage: window.location.pathname,
      });

      toast.success("Your compliance request has been sent.");
      setFormData({
        name: "",
        company: "",
        email: "",
        country: "",
        requiredProduct: "",
        requiredCertificate: "CE",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit compliance request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[3px] border border-slate-200 bg-white text-[#0F172A] shadow-2xl dark:border-slate-700 dark:bg-slate-950 dark:text-white">
      <div className="border-b border-slate-200 bg-[#F8FAFC] px-6 py-5 md:px-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8] dark:text-slate-400">
          Project Request
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-[#0F172A] dark:text-white">
          Request Compliance Documents
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475569] dark:text-slate-300">
          Share the product model and the certificate type you need. Our team will confirm the
          latest available file for your project or customs workflow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Name <span className="text-orange-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Company <span className="text-orange-400">*</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              required
              placeholder="Company name"
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Email <span className="text-orange-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Country <span className="text-orange-400">*</span>
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="Country / region"
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label
              htmlFor="requiredProduct"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Required Product <span className="text-orange-400">*</span>
            </label>
            <input
              id="requiredProduct"
              name="requiredProduct"
              type="text"
              value={formData.requiredProduct}
              onChange={handleChange}
              required
              placeholder="Model, family, or material"
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label
              htmlFor="requiredCertificate"
              className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
            >
              Required Certificate <span className="text-orange-400">*</span>
            </label>
            <select
              id="requiredCertificate"
              name="requiredCertificate"
              value={formData.requiredCertificate}
              onChange={handleChange}
              className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
            >
              {certificateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-[#1E293B] dark:text-slate-200"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Project scope, target market, customs needs, or specific batch requests"
            className="w-full rounded-sm border border-slate-200 bg-[#FFFFFF] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/25"
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <p className="text-xs leading-6 text-[#64748B] dark:text-slate-400">
            By submitting this form, you agree to our{" "}
            <Link
              href="/resources"
              className="text-blue-700 hover:text-blue-800 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
            >
              documentation support policy
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full justify-center md:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Request Compliance Documents"}
          </button>
        </div>
      </form>
    </div>
  );
}
