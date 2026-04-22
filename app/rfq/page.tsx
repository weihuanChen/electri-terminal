"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared";
import { Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { submitPublicInquiry } from "@/lib/inquiry-client";

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  notes: string;
}

export default function RFQPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<RFQItem[]>([
    { id: "1", productId: "", quantity: 1, notes: "" },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    phone: "",
    message: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof RFQItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    const validItems = items.filter((item) => item.productId.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPublicInquiry({
        type: "rfq",
        ...formData,
        replyTo: formData.email,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        attachmentName: attachment?.name,
        sourcePage: window.location.pathname,
      });

      toast.success("Your RFQ has been submitted successfully. Our team will reply as soon as possible.");
      setFormData({
        name: "",
        email: "",
        company: "",
        country: "",
        phone: "",
        message: "",
      });
      setItems([{ id: "1", productId: "", quantity: 1, notes: "" }]);
      setAttachment(null);
    } catch (error) {
      console.error("Failed to submit RFQ:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit RFQ. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [{ label: "RFQ" }];

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
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Request for Quotation</h1>
            <p className="text-lg text-secondary">
              Tell us what products you need and we will provide you with a competitive quote
              tailored to your requirements.
            </p>
          </div>
        </div>
      </section>

      {/* RFQ Form */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="card">
              {/* Contact Information */}
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

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
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Your country"
                    />
                  </div>

                  <div className="md:col-span-2">
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
              </div>

              {/* Products */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Products</h2>
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
                            Product Model/Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.productId}
                            onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g., EP-2000-X1"
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
                              handleItemChange(item.id, "quantity", parseInt(e.target.value) || 1)
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
                          onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          placeholder="Optional specifications or requirements"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachment */}
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold mb-6">Attachment (Optional)</h2>

                <div className="flex items-center gap-4">
                  <label className="btn btn-secondary cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                    <Upload className="h-5 w-5 mr-2" />
                    Choose File
                  </label>

                  {attachment && (
                    <span className="text-sm text-secondary">{attachment.name}</span>
                  )}
                </div>

                <p className="text-xs text-secondary mt-2">
                  Accepted formats: PDF, DOC, XLS. Maximum size: 10MB
                </p>
              </div>

              {/* Additional Message */}
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold mb-6">Additional Information</h2>

                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-vertical"
                  placeholder="Any additional requirements, specifications, or questions..."
                />
              </div>

              {/* Submit */}
              <div className="p-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit RFQ"}
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
      </section>

      {/* Help Section */}
      <section className="section bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-secondary mb-6">
              Our team is ready to assist you with product selection, technical specifications,
              and pricing information.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-outline">
                Contact Sales
              </Link>
              <Link href="/categories" className="btn btn-secondary">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
