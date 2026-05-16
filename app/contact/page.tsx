"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared";
import { Mail, Phone, MapPin, Building, MessageCircle, Globe, Linkedin } from "lucide-react";
import Link from "next/link";
import {
  getEnabledSocialMediaLinks,
  getSocialMediaDisplayLabel,
  normalizePublicContactSettings,
} from "@/lib/contactConfig";
import { submitPublicInquiry } from "@/lib/inquiry-client";

export default function ContactPage() {
  const contactSettings = normalizePublicContactSettings(
    useQuery(api.frontend.getPublicContactSettings)
  );
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    phone: "",
    message: "",
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
        type: "general",
        ...formData,
        replyTo: formData.email,
        sourcePage: window.location.pathname,
      });

      toast.success("Thank you for your message. Our team will respond as soon as possible.");
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
        error instanceof Error ? error.message : "Failed to send message. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [{ label: "Contact" }];
  const contactInfoItems = [
    contactSettings.email.enabled && contactSettings.email.value
      ? {
          key: "email",
          icon: Mail,
          title: "Email",
          lines: [contactSettings.email.value],
          href: `mailto:${contactSettings.email.value}`,
        }
      : null,
    contactSettings.whatsapp.enabled && contactSettings.whatsapp.value
      ? {
          key: "whatsapp",
          icon: MessageCircle,
          title: "WhatsApp",
          lines: [contactSettings.whatsapp.value],
          href: contactSettings.whatsapp.href,
          external: true,
        }
      : null,
    contactSettings.phone.enabled && contactSettings.phone.value
      ? {
          key: "phone",
          icon: Phone,
          title: "Phone",
          lines: [contactSettings.phone.value],
          href: `tel:${contactSettings.phone.value.replace(/\s+/g, "")}`,
        }
      : null,
    contactSettings.address.enabled && contactSettings.address.lines.length > 0
      ? {
          key: "address",
          icon: MapPin,
          title: "Address",
          lines: contactSettings.address.lines,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Page Header */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Contact Us</h1>
            <p className="text-lg text-secondary">
              Have a question or need assistance? We are here to help. Reach out to us
              through the form below or use our contact information.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold">Send us a Message</h2>
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
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-vertical"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>

                  <p className="text-xs text-secondary text-center">
                    By submitting this form, you agree to our{" "}
                    <Link href="/resources" className="text-primary hover:underline">
                      Documentation Policy
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfoItems.length === 0 && (
                    <p className="text-sm text-secondary">
                      Contact channels are currently unavailable. Please use the message form.
                    </p>
                  )}
                  {contactInfoItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="text-sm text-secondary hover:text-primary transition-colors"
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noopener noreferrer" : undefined}
                            >
                              {item.lines.map((line, index) => (
                                <span key={`${item.key}-${index}`} className="block">
                                  {line}
                                </span>
                              ))}
                            </Link>
                          ) : (
                            <p className="text-sm text-secondary">
                              {item.lines.map((line, index) => (
                                <span key={`${item.key}-${index}`} className="block">
                                  {line}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Social</h3>
                  <div className="space-y-3">
                    {socialLinks.map((item) => {
                      const isLinkedIn = item.platform.trim().toLowerCase() === "linkedin";
                      const Icon = isLinkedIn ? Linkedin : Globe;

                      return (
                        <a
                          key={`${item.platform}-${item.url}`}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">
                                {getSocialMediaDisplayLabel(item)}
                              </p>
                              <p className="text-xs text-secondary">Open social profile</p>
                            </div>
                          </div>
                          <span className="text-xs text-secondary">Visit</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Business Hours */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
                <p className="text-xs text-secondary mt-4 pt-4 border-t border-border">
                  All times are in Beijing Time (UTC+8)
                </p>
              </div>

              {/* Quick Links */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/rfq" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Building className="h-5 w-5" />
                    Request a Quote
                  </Link>
                  <Link href="/categories" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Building className="h-5 w-5" />
                    Browse Products
                  </Link>
                  <Link href="/resources" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Building className="h-5 w-5" />
                    Documentation Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
