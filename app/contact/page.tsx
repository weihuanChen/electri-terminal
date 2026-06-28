"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Breadcrumb, FAQAccordion, CTABanner } from "@/components/shared";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Send,
  TestTube2,
  Truck,
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

const rfqChecklistItems = [
  "Product Family",
  "Model",
  "Quantity",
  "Target Market",
  "Material",
  "Certification Requirement",
  "Drawing (Optional)",
  "Target Delivery Date",
];

const projectInformationRows = [
  {
    item: "MOQ",
    practice:
      "Determined by product family, factory packaging, and customization requirements.",
  },
  {
    item: "Production Lead Time",
    practice:
      "Standard catalog products are typically completed within approximately one working week after order confirmation.",
  },
  {
    item: "Samples",
    practice: "Engineering samples are available for evaluation before production.",
  },
  {
    item: "Packaging",
    practice:
      "Factory pack, export carton, pallet, and OEM/private-label packaging available.",
  },
  {
    item: "Shipping",
    practice:
      "Air freight for samples and urgent orders; sea freight for production shipments.",
  },
  {
    item: "Compliance",
    practice:
      "Existing documentation is reviewed first. Additional testing or certification can be discussed based on project requirements.",
  },
];

const submissionProcessSteps = [
  {
    title: "RFQ Submitted",
    icon: Send,
  },
  {
    title: "Engineering Review",
    icon: ClipboardCheck,
  },
  {
    title: "Quotation",
    icon: FileText,
  },
  {
    title: "Sample",
    note: "if required",
    icon: TestTube2,
  },
  {
    title: "Production Confirmation",
    icon: CheckCircle2,
  },
  {
    title: "Shipment",
    icon: Truck,
  },
];


const contactFaqItems = [
  {
    question: "How can I receive a quotation faster?",
    answer:
      "For the fastest quotation, include the product, model or item number, quantity, destination country, drawing if available, and any certification requirements. Clear project details help us confirm pricing, MOQ, lead time, and shipping options with fewer follow-up questions.",
  },
  {
    question: "How is production lead time confirmed?",
    answer:
      "Production lead time is confirmed after reviewing product specifications, order quantity, customization requirements, and current production scheduling. Standard catalog products are typically completed within approximately one working week after order confirmation.",
  },
  {
    question: "Can I order samples before production?",
    answer:
      "Yes. Engineering samples are available for evaluation before production. Sample shipments are typically arranged by air so buyers can review parts before moving into a production order.",
  },
  {
    question: "How is MOQ determined?",
    answer:
      "MOQ is reviewed based on the product, factory pack, OEM packaging or labeling needs, and customization requirements. Sharing these details upfront helps us confirm a workable order plan faster.",
  },
  {
    question: "Can multiple products be shipped together?",
    answer:
      "Yes. Mixed SKU and consolidated shipment arrangements can be discussed so multiple products can ship together when packing, schedule, and destination requirements allow.",
  },
  {
    question: "How are certification requests handled?",
    answer:
      "Certification requests start with existing document review, then coverage confirmation for the requested product and application. Additional testing can be discussed if required by the project.",
  },
];

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
      <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-border transition-colors duration-300">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="pt-16 pb-20 transition-colors duration-300">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-20">
            {/* Hero */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-slate-950 dark:text-slate-50 transition-colors duration-300">Contact Us</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors duration-300">
                Reach our sales and engineering team through one page. Send a general inquiry or
                switch to the quote workflow for pricing, MOQ, and lead-time review.
              </p>
            </div>

            {/* Switch & Form Container */}
            <div id="request-quote" className="scroll-mt-28 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-colors duration-300">
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 space-y-6 transition-colors duration-300">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">{formTitle}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{formDescription}</p>
                </div>

                <div className="inline-flex flex-wrap bg-slate-100 dark:bg-slate-900/50 p-1 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                  <button
                    type="button"
                    onClick={() => handleModeChange("general")}
                    className={`px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      !isRfqMode
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    General Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("rfq")}
                    className={`px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isRfqMode
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Request a Quote
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-0">
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-6 text-slate-950 dark:text-slate-50 transition-colors duration-300">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Company {isRfqMode && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required={isRfqMode}
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Country {isRfqMode && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        required={isRfqMode}
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Your country"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {isRfqMode && (
                  <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">Quote Items</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                          Add item numbers, model names, or short descriptions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors duration-300 text-sm font-semibold whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4" />
                        Add Product
                      </button>
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={item.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative group transition-colors duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors duration-300">
                              Item 0{index + 1}
                            </span>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 absolute top-4 right-4"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
                                Product Model or Item Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.productId}
                                onChange={(e) =>
                                  handleItemChange(item.id, "productId", e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder="e.g., RNB5.5-8, custom copper lug"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
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
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">Notes</label>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) =>
                                handleItemChange(item.id, "notes", e.target.value)
                              }
                              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="Material, plating, certification, or packaging requirements"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                      If you need to share drawings or spreadsheets, mention it in the message below and we will coordinate via email.
                    </p>
                  </div>
                )}

                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2 transition-colors duration-300">
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
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-vertical transition-colors duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={
                      isRfqMode
                        ? "Add target lead time, application details, or other commercial notes..."
                        : "Tell us how we can help you..."
                    }
                  />
                </div>

                <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-300">
                  <p className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left transition-colors duration-300">
                    By submitting, you agree to our{" "}
                    <Link href="/resources" className="text-primary hover:underline font-medium">
                      Documentation Policy
                    </Link>
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-semibold order-1 sm:order-2 disabled:opacity-70"
                  >
                    {isSubmitting
                      ? isRfqMode
                        ? "Submitting..."
                        : "Sending..."
                      : isRfqMode
                        ? "Submit Quote Request"
                        : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardCheck className="h-6 w-6 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
                <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">Before Sending Your RFQ</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                {rfqChecklistItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Information Table */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">
                  Project Information
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  Typical practices and requirements. Final confirmation is based on product family and scope.
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 transition-colors duration-300">
                      <tr>
                        <th className="w-56 border-b border-slate-200 dark:border-slate-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 transition-colors duration-300">
                          Project Item
                        </th>
                        <th className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 transition-colors duration-300">
                          Typical Practice
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectInformationRows.map((row) => (
                        <tr key={row.item} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-300">
                          <th scope="row" className="align-top px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                            {row.item}
                          </th>
                          <td className="px-6 py-4 text-sm leading-6 text-slate-700 dark:text-slate-300 transition-colors duration-300">
                            {row.practice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Timeline: What Happens Next */}
            <div>
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">
                  What Happens Next
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  The typical project path from RFQ review to production confirmation and shipment.
                </p>
              </div>
              
              <div className="relative">
                {/* Desktop Connecting Line */}
                <div className="hidden lg:block absolute top-[2rem] left-8 right-8 h-[2px] bg-slate-200 dark:bg-slate-800 transition-colors duration-300 -z-10"></div>
                
                <div className="grid grid-cols-1 gap-10 lg:gap-4 lg:grid-cols-6 relative z-0">
                  {submissionProcessSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="relative flex lg:flex-col items-start lg:items-center gap-5 lg:gap-4 group">
                        {/* Mobile Connecting Line */}
                        {index < submissionProcessSteps.length - 1 && (
                           <div className="lg:hidden absolute left-[1.95rem] top-12 bottom-[-3rem] w-[2px] bg-slate-200 dark:bg-slate-800 transition-colors duration-300 -z-10"></div>
                        )}
                        
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 group-hover:border-primary dark:group-hover:border-primary group-hover:text-primary dark:group-hover:text-primary transition-all duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="pt-1 lg:pt-0 lg:text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 transition-colors duration-300">
                            Step 0{index + 1}
                          </p>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                            {step.title}
                          </h3>
                          {step.note ? (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
                              {step.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Project FAQ */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">
                  Project FAQ
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  Short answers to the buying questions that usually slow down quotation and review.
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
                <FAQAccordion items={contactFaqItems} />
              </div>
            </div>

            {/* Downgraded Contact Info Section */}
            <div className="pt-16 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-5 uppercase tracking-wider transition-colors duration-300">Contact Details</h3>
                  <div className="space-y-4">
                    {contactInfoItems.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">Contact channels unavailable.</p>
                    )}
                    {contactInfoItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-start gap-3">
                          <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0 transition-colors duration-300" />
                          <div>
                            {item.href ? (
                              <Link href={item.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 font-medium" target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
                                {item.lines.map((line, index) => <span key={`${item.key}-${index}`} className="block">{line}</span>)}
                              </Link>
                            ) : (
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-300">{item.lines.map((line, index) => <span key={`${item.key}-${index}`} className="block">{line}</span>)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Social Media */}
                {socialLinks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-5 uppercase tracking-wider transition-colors duration-300">Connect</h3>
                    <div className="space-y-4">
                      {socialLinks.map((item) => {
                        const isLinkedIn = item.platform.trim().toLowerCase() === "linkedin";
                        const Icon = isLinkedIn ? Linkedin : Globe;
                        return (
                          <a key={`${item.platform}-${item.url}`} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                            <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 shrink-0" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 font-medium">{getSocialMediaDisplayLabel(item)}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Business Hours */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-5 uppercase tracking-wider transition-colors duration-300">Business Hours</h3>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-300">
                    <div className="flex justify-between"><span>Mon - Fri</span><span>9:00 AM - 6:00 PM</span></div>
                    <div className="flex justify-between"><span>Saturday</span><span>10:00 AM - 4:00 PM</span></div>
                    <div className="flex justify-between text-slate-400 dark:text-slate-500"><span>Sunday</span><span>Closed</span></div>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">All times in Beijing Time (UTC+8)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <CTABanner 
        title="Ready to Start Your Project?" 
        description="Connect with our engineering team for a comprehensive technical review." 
        primaryCTA={{ label: "View Products", href: "/products" }}
        secondaryCTA={{ label: "Browse Resources", href: "/resources" }}
        variant="default"
      />
    </>
  );
}
