export type InquiryType = "general" | "product" | "rfq";

export type InquirySourceType =
  | "category"
  | "family"
  | "product"
  | "article"
  | "general";

export interface InquiryItemInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface PublicInquiryPayload {
  type: InquiryType;
  name: string;
  email: string;
  replyTo?: string;
  company?: string;
  country?: string;
  phone?: string;
  message?: string;
  sourceType?: InquirySourceType;
  sourceId?: string;
  sourcePage?: string;
  attachmentName?: string;
  items?: InquiryItemInput[];
}
