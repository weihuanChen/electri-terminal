"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Breadcrumb, FAQAccordion, CTABanner } from "@/components/shared";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FileUp,
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
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getEnabledSocialMediaLinks,
  getSocialMediaDisplayLabel,
  type PublicContactSettings,
} from "@/lib/contactConfig";
import { submitPublicInquiry } from "@/lib/inquiry-client";
import { getPageType, trackGA4Event } from "@/lib/analytics";
import { productsUrl, resourcesUrl } from "@/lib/routes";

type InquiryMode = "general" | "rfq";

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  quantityUnit: "pcs" | "packs" | "cartons" | "unknown";
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

type AttachmentField = "drawing" | "bom";
type RFQAttachments = Record<AttachmentField, File | null>;

const INITIAL_ATTACHMENTS: RFQAttachments = { drawing: null, bom: null };

// Keep in sync with ATTACHMENT_CONFIGS / size limits in app/api/inquiries/route.ts
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_FIELDS: { field: AttachmentField; label: string; hint: string; accept: string }[] = [
  {
    field: "drawing",
    label: "Drawing or Sample Photo",
    hint: "PDF, DWG, DXF, STEP, IGES, JPG, PNG · max 10 MB",
    accept: ".pdf,.dwg,.dxf,.step,.stp,.igs,.iges,.jpg,.jpeg,.png",
  },
  {
    field: "bom",
    label: "BOM or Part List",
    hint: "XLSX, XLS, CSV, PDF · max 10 MB",
    accept: ".xlsx,.xls,.csv,.pdf",
  },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const INITIAL_RFQ_ITEMS: RFQItem[] = [{ id: "1", productId: "", quantity: 1, quantityUnit: "unknown", notes: "" }];

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

export default function ContactPageClient({
  contactSettings,
}: {
  contactSettings: PublicContactSettings;
}) {
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [items, setItems] = useState<RFQItem[]>(INITIAL_RFQ_ITEMS);
  const [attachments, setAttachments] = useState<RFQAttachments>(INITIAL_ATTACHMENTS);

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

  const handleFileChange = (field: AttachmentField, file: File | null) => {
    if (file && file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Each file must be 10 MB or smaller. For larger files, send them by email.");
      return;
    }
    setAttachments((prev) => ({ ...prev, [field]: file }));
  };

  const handleItemChange = (id: string, field: keyof RFQItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), productId: "", quantity: 1, quantityUnit: "unknown", notes: "" },
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
        quantityUnit: item.quantityUnit,
        notes: item.notes.trim(),
      }))
      .filter((item) => item.productId.length > 0);

    const hasAttachments = isRfqMode && Boolean(attachments.drawing || attachments.bom);

    if (isRfqMode && validItems.length === 0 && !hasAttachments) {
      toast.error("Please attach a drawing or add at least one part / item number.");
      return;
    }

    const rfqItems = isRfqMode
      ? validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          quantityUnit: item.quantityUnit,
          notes: item.notes || undefined,
        }))
      : undefined;
    // Keep the query string (e.g. ?source=blog&article=...) so inquiries show which page sent the buyer.
    const sourcePage = `${window.location.pathname}${window.location.search}${isRfqMode ? "#request-quote" : ""}`.slice(0, 260); // API limit

    try {
      setIsSubmitting(true);
      if (hasAttachments) {
        // Multipart so the API can forward drawings/BOM as email attachments.
        const payload = new FormData();
        payload.append("type", inquiryMode);
        (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
          const value = key === "message" ? trimmedMessage : formData[key].trim();
          if (value) payload.append(key, value);
        });
        payload.append("replyTo", formData.email);
        payload.append("sourcePage", sourcePage);
        if (rfqItems && rfqItems.length > 0) payload.append("items", JSON.stringify(rfqItems));
        if (attachments.drawing) payload.append("drawing", attachments.drawing);
        if (attachments.bom) payload.append("bom", attachments.bom);
        await submitPublicInquiry(payload);
      } else {
        await submitPublicInquiry({
          type: inquiryMode,
          ...formData,
          message: trimmedMessage || undefined,
          replyTo: formData.email,
          items: rfqItems,
          sourcePage,
        });
      }

      trackGA4Event("rfq_submit", {
        inquiry_type: inquiryMode,
        source_type: "general",
        page_path: window.location.pathname,
        page_type: getPageType(window.location.pathname),
        has_drawing: Boolean(attachments.drawing),
        has_bom: Boolean(attachments.bom),
      });

      toast.success(
        isRfqMode
          ? "Your quote request has been submitted successfully."
          : "Thank you for your message. Our team will respond as soon as possible."
      );
      setFormData(INITIAL_FORM_DATA);
      setItems(INITIAL_RFQ_ITEMS);
      setAttachments(INITIAL_ATTACHMENTS);
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
    contactSettings.wechat?.enabled && contactSettings.wechat.value
      ? {
          key: "wechat",
          icon: MessageCircle,
          title: "WeChat",
          lines: [contactSettings.wechat.value],
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
      <div className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-border-light transition-colors duration-300">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-slate-50/50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-300">
        <div className="container space-y-20 md:space-y-24">
          {/* Editorial Hero */}
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Sales & Engineering Desk
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-slate-950 dark:text-slate-50 transition-colors duration-300">
              Contact Us
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400 transition-colors duration-300">
              Reach our sales and engineering team through one workspace. Send a general inquiry or
              switch to the quote workflow for pricing, MOQ, and lead-time review.
            </p>
          </div>

          {/* Asymmetric 2-Column Workspace: Form (Left) + Companion Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Main Form Column */}
            <div
              id="request-quote"
              className="lg:col-span-7 xl:col-span-8 scroll-mt-28 rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50/80 via-white to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800/80 space-y-6 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 transition-colors duration-300">
                      {formTitle}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl transition-colors duration-300">
                      {formDescription}
                    </p>
                  </div>
                </div>

                <div className="inline-flex flex-wrap rounded-card bg-slate-100/90 dark:bg-slate-900 p-1.5 border border-slate-200/70 dark:border-slate-800 transition-colors duration-300">
                  <button
                    type="button"
                    onClick={() => handleModeChange("general")}
                    className={`rounded-control px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      !isRfqMode
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    General Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("rfq")}
                    data-ga-event="rfq_click"
                    data-ga-param-placement="contact_mode_switch"
                    className={`rounded-control px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isRfqMode
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Request a Quote
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                <div>
                  <h3 className="text-base font-semibold mb-5 text-slate-950 dark:text-slate-50 transition-colors duration-300">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Company {isRfqMode && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required={isRfqMode}
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                        Country {isRfqMode && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        required={isRfqMode}
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Your country"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Your phone number with country code"
                    />
                  </div>
                </div>

                {isRfqMode && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">
                      Drawings &amp; Files
                    </h3>
                    <p className="mt-1 mb-4 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                      For custom parts, a drawing or a clear photo of your sample is the fastest way to get an accurate quote.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {ATTACHMENT_FIELDS.map(({ field, label, hint, accept }) => {
                        const file = attachments[field];
                        return (
                          <div key={field}>
                            {file ? (
                              <div className="flex items-center justify-between gap-3 rounded-control border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
                                <span className="flex min-w-0 items-center gap-2 text-slate-800 dark:text-slate-200">
                                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="shrink-0 text-xs text-slate-500">{formatFileSize(file.size)}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleFileChange(field, null)}
                                  className="shrink-0 p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  aria-label={`Remove ${label}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <label
                                htmlFor={`contact-rfq-${field}`}
                                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-control border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-4 py-5 text-center transition-colors hover:border-primary hover:bg-primary/5"
                              >
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  <FileUp className="h-4 w-4 text-primary" />
                                  {label}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
                              </label>
                            )}
                            <input
                              key={file ? `${file.name}-${file.size}` : "empty"}
                              id={`contact-rfq-${field}`}
                              type="file"
                              accept={accept}
                              className="sr-only"
                              onChange={(e) => handleFileChange(field, e.target.files?.[0] ?? null)}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50 transition-colors duration-300">
                          Quote Items
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                          Describe each custom part, or enter item numbers for standard terminals. Optional if you attached a drawing.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center justify-center gap-2 rounded-control px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors duration-200 text-sm font-semibold whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4" />
                        Add Product
                      </button>
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-card bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 relative group transition-colors duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <span className="inline-flex items-center rounded-control bg-white dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                              Item 0{index + 1}
                            </span>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 absolute top-4 right-4 p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                                Part Name, Model or Item Number
                              </label>
                              <input
                                type="text"
                                value={item.productId}
                                onChange={(e) =>
                                  handleItemChange(item.id, "productId", e.target.value)
                                }
                                className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder="e.g., custom copper lug per drawing, RNB5.5-8"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
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
                                  className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <select
                                  value={item.quantityUnit}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "quantityUnit",
                                      e.target.value as RFQItem["quantityUnit"]
                                    )
                                  }
                                  className="w-36 shrink-0 rounded-control border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                  <option value="pcs">Pieces (pcs)</option>
                                  <option value="packs">Packs</option>
                                  <option value="cartons">Cartons</option>
                                  <option value="unknown">Not sure</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) =>
                                handleItemChange(item.id, "notes", e.target.value)
                              }
                              className="w-full rounded-control px-4 py-2.5 border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="Material, plating (e.g., tin), brazing, certification, or packaging requirements"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-l-2 border-primary/40 pl-3 transition-colors duration-300">
                      Files larger than 10 MB? Submit the form and mention it below. We will reply with an email address for large files.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
                  <label htmlFor="message" className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors duration-300">
                    {isRfqMode ? "Additional Information" : "Message"}{" "}
                    {!isRfqMode && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required={!isRfqMode}
                    rows={isRfqMode ? 4 : 5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-control px-4 py-3 border border-slate-300/90 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-vertical transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={
                      isRfqMode
                        ? "Add target lead time, application details, or other commercial notes..."
                        : "Tell us how we can help you..."
                    }
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left transition-colors duration-300">
                    By submitting, you agree to our{" "}
                    <Link href={resourcesUrl()} className="text-primary hover:underline font-medium">
                      Documentation Policy
                    </Link>
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full sm:w-auto px-8 py-3 order-1 sm:order-2 disabled:opacity-70"
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

            {/* Companion Sidebar: Checklist + Direct Contact Channels */}
            <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
              {/* RFQ Preparation Checklist Card */}
              <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-blue-50/35 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/40 p-6 sm:p-7 shadow-xs transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Fast Quotation Tip
                    </p>
                    <h2 className="text-base font-bold text-slate-950 dark:text-slate-50">
                      Before Sending Your RFQ
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Including these details helps our engineering team confirm pricing, MOQ, and lead time with fewer follow-ups:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                  {rfqChecklistItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-control bg-white/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 px-3 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Contact & Hours Card */}
              <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-7 shadow-xs space-y-6 transition-colors duration-300">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.14em]">
                    Direct Contact Channels
                  </h3>
                  <div className="space-y-3.5">
                    {contactInfoItems.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Contact channels unavailable.
                      </p>
                    )}
                    {contactInfoItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {item.title}
                            </p>
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="text-sm text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors font-medium break-words"
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
                              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium break-words">
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
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.14em]">
                      Connect
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((item) => {
                        const isLinkedIn = item.platform.trim().toLowerCase() === "linkedin";
                        const Icon = isLinkedIn ? Linkedin : Globe;
                        return (
                          <a
                            key={`${item.platform}-${item.url}`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-control border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{getSocialMediaDisplayLabel(item)}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.14em]">
                    Business Hours (UTC+8)
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex justify-between">
                      <span>Mon – Fri</span>
                      <span className="text-slate-900 dark:text-slate-200">9:00 AM – 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-slate-900 dark:text-slate-200">10:00 AM – 4:00 PM</span>
                    </div>
                    <div className="flex justify-between text-slate-400 dark:text-slate-500">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Timeline: What Happens Next */}
          <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-7 sm:p-10">
            <div className="max-w-2xl mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Order Workflow
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                What Happens Next
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                The typical project path from RFQ review to production confirmation and shipment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {submissionProcessSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="group relative flex flex-col justify-between rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center rounded-control bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                        0{index + 1}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-control bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {step.title}
                      </h3>
                      {step.note ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {step.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Information: De-tabled into 3x2 Editorial Cards */}
          <div>
            <div className="max-w-2xl mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Commercial Reference
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                Project Information
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Typical practices and requirements. Final confirmation is based on product family and scope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projectInformationRows.map((row, index) => (
                <div
                  key={row.item}
                  className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {row.item}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {row.practice}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Project FAQ: Asymmetric 2-Column Split */}
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-14 pt-4">
            <div className="lg:sticky lg:top-28">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Common Questions
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                Project FAQ
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Short answers to the buying questions that usually slow down quotation and review.
              </p>
            </div>
            <div>
              <FAQAccordion items={contactFaqItems} />
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        title="Ready to Start Your Project?"
        description="Connect with our engineering team for a comprehensive technical review."
        primaryCTA={{ label: "View Products", href: productsUrl() }}
        secondaryCTA={{ label: "Browse Resources", href: resourcesUrl() }}
        variant="default"
      />
    </>
  );
}
