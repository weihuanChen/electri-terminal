"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { submitPublicInquiry } from "@/lib/inquiry-client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    phone: "",
    message: productName ? `I'm interested in ${productName}. ` : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPublicInquiry({
        type: sourceType === "general" ? "general" : "product",
        ...formData,
        replyTo: formData.email,
        sourceType,
        sourceId,
        sourcePage: window.location.pathname,
      });

      toast.success("Thank you for your inquiry. Our team will respond as soon as possible.");
      setFormData({
        name: "",
        email: "",
        company: "",
        country: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit inquiry. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Send Inquiry</h2>
        <p className="text-sm text-secondary mt-1">
          Fill out the form below and our team will respond as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
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

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Company name"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Your country"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-vertical"
            placeholder="Tell us about your requirements..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? "Submitting..." : "Send Inquiry"}
        </button>

        <p className="text-xs text-secondary text-center">
          By submitting this form, you agree to our{" "}
          <Link href="/resources" className="text-primary hover:underline">
            Documentation Policy
          </Link>
        </p>
      </form>
    </div>
  );
}
