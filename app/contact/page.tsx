"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared";
import {
  Building,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  getEnabledSocialMediaLinks,
  getSocialMediaDisplayLabel,
  normalizePublicContactSettings,
} from "@/lib/contactConfig";
import { submitPublicInquiry } from "@/lib/inquiry-client";

type InquiryMode = "general" | "rfq";

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  notes: string;
}

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  company: "",
  country: "",
  phone: "",
  message: "",
};

const INITIAL_RFQ_ITEMS: RFQItem[] = [{ id: "1", productId: "", quantity: 1, notes: "" }];

export default function ContactPage() {
  const contactSettings = normalizePublicContactSettings(
    useQuery(api.frontend.getPublicContactSettings)
  );
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [items, setItems] = useState<RFQItem[]>(INITIAL_RFQ_ITEMS);

  useEffect(() => {
    const syncModeFromHash = () => {
      setInquiryMode(window.location.hash === "#request-quote" ? "rfq" : "general");
    };

    syncModeFromHash();
    window.addEventListener("hashchange", syncModeFromHash);

    return () => {
      window.removeEventListener("hashchange", syncModeFromHash);
    };
  }, []);

  const updateHashForMode = (mode: InquiryMode) => {
    const nextUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(
      null,
      "",
      mode === "rfq" ? `${nextUrl}#request-quote` : nextUrl
    );
  };

  const handleModeChange = (mode: InquiryMode) => {
    setInquiryMode(mode);
    updateHashForMode(mode);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof RFQItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), productId: "", quantity: 1, notes: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    const trimmedMessage = formData.message.trim();
    const isRfqMode = inquiryMode === "rfq";

    if (!isRfqMode && trimmedMessage.length === 0) {
      toast.error("Please include your message.");
      return;
    }

    if (isRfqMode && (!formData.company.trim() || !formData.country.trim())) {
      toast.error("Please fill in company and country for quote requests.");
      return;
    }

    const validItems = items
      .map((item) => ({
        productId: item.productId.trim(),
        quantity: item.quantity,
        notes: item.notes.trim(),
      }))
      .filter((item) => item.productId.length > 0);

    if (isRfqMode && validItems.length === 0) {
      toast.error("Please add at least one product or item number.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPublicInquiry({
        type: inquiryMode,
        ...formData,
        message: trimmedMessage || undefined,
        replyTo: formData.email,
        items: isRfqMode
          ? validItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              notes: item.notes || undefined,
            }))
          : undefined,
        sourcePage: `${window.location.pathname}${isRfqMode ? "#request-quote" : ""}`,
      });

      toast.success(
        isRfqMode
          ? "Your quote request has been submitted successfully."
          : "Thank you for your message. Our team will respond as soon as possible."
      );
      setFormData(INITIAL_FORM_DATA);
      setItems(INITIAL_RFQ_ITEMS);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit inquiry. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [{ label: "Contact" }];
  const isRfqMode = inquiryMode === "rfq";
  const formTitle = isRfqMode ? "Request a Quote" : "Send us a Message";
  const formDescription = isRfqMode
    ? "Use the quote workflow for item numbers, target quantities, OEM requirements, and lead-time review."
    : "Use the general inquiry workflow for product questions, documentation requests, and technical support.";

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
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Contact Us</h1>
            <p className="text-lg text-secondary">
              Reach our sales and engineering team through one page. Send a general inquiry or
              switch to the quote workflow for pricing, MOQ, and lead-time review.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div id="request-quote" className="card scroll-mt-28">
                <div className="p-6 border-b border-border space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">{formTitle}</h2>
                    <p className="mt-2 text-sm text-secondary">{formDescription}</p>
                  </div>

                  <div className="inline-flex flex-wrap rounded-lg bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => handleModeChange("general")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        !isRfqMode
                          ? "bg-white text-foreground shadow-sm"
                          : "text-secondary hover:text-foreground"
                      }`}
                    >
                      General Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("rfq")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        isRfqMode
                          ? "bg-white text-foreground shadow-sm"
                          : "text-secondary hover:text-foreground"
                      }`}
                    >
                      Request a Quote
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-0">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold mb-6">Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium mb-2">
                          Company {isRfqMode && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          required={isRfqMode}
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          placeholder="Company name"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-2">
                          Country {isRfqMode && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          required={isRfqMode}
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          placeholder="Your country"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
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
                  </div>

                  {isRfqMode && (
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold">Quote Items</h3>
                          <p className="mt-1 text-sm text-secondary">
                            Add item numbers, model names, or short descriptions for the parts you
                            want quoted.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addItem}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </button>
                      </div>

                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div key={item.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start justify-between mb-4">
                              <span className="text-sm font-semibold text-secondary">
                                Item {index + 1}
                              </span>
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                  Product Model or Item Number{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={item.productId}
                                  onChange={(e) =>
                                    handleItemChange(item.id, "productId", e.target.value)
                                  }
                                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                  placeholder="e.g., RNB5.5-8, cable gland PG13.5, custom copper lug"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "quantity",
                                      parseInt(e.target.value, 10) || 1
                                    )
                                  }
                                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-medium mb-2">Notes</label>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) =>
                                  handleItemChange(item.id, "notes", e.target.value)
                                }
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Material, plating, insulation, certification, or packaging requirements"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 text-xs text-secondary">
                        If you need to share drawings or spreadsheets, mention that in the notes or
                        message and our team will coordinate the next step by email.
                      </p>
                    </div>
                  )}

                  <div className="p-6 border-b border-border">
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {isRfqMode ? "Additional Information" : "Message"}{" "}
                      {!isRfqMode && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required={!isRfqMode}
                      rows={isRfqMode ? 4 : 6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-vertical"
                      placeholder={
                        isRfqMode
                          ? "Add target lead time, certifications, application details, or other commercial notes..."
                          : "Tell us how we can help you..."
                      }
                    />
                  </div>

                  <div className="p-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-full"
                    >
                      {isSubmitting
                        ? isRfqMode
                          ? "Submitting Quote Request..."
                          : "Sending..."
                        : isRfqMode
                          ? "Submit Quote Request"
                          : "Send Message"}
                    </button>

                    <p className="text-xs text-secondary text-center mt-4">
                      By submitting this form, you agree to our{" "}
                      <Link href="/resources" className="text-primary hover:underline">
                        Documentation Policy
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfoItems.length === 0 && (
                    <p className="text-sm text-secondary">
                      Contact channels are currently unavailable. Please use the form on this page.
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

              <div className="card p-6">
                <h3 className="font-semibold mb-4">For Quote Requests</h3>
                <div className="space-y-3 text-sm text-secondary">
                  <p>Include item numbers whenever possible so MOQ and lead time can be checked faster.</p>
                  <p>Share target quantity, material, insulation, and certification requirements.</p>
                  <p>Use the quote mode on this page for structured RFQ submissions.</p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link
                    href="/contact#request-quote"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Building className="h-5 w-5" />
                    Request a Quote
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Building className="h-5 w-5" />
                    Browse Products
                  </Link>
                  <Link
                    href="/resources"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
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
