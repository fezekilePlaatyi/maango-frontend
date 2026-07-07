export type Role = "client" | "pro" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface ClientProfile {
  userId: string;
  address?: string;
  city?: string;
}

export type ProStatus = "draft" | "pending" | "approved" | "denied";
export type SubStatus = "none" | "pending" | "trialing" | "active" | "past_due" | "canceled";
export type IdentityDocumentType = "sa_id" | "passport";
export type GalleryMediaType = "image" | "video";
export type SocialPlatform = "tiktok" | "facebook" | "linkedin" | "twitter" | "pinterest";

export interface UploadedAsset {
  url: string;
  storagePath: string;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface IdentityDocument extends UploadedAsset {
  type: IdentityDocumentType;
}

export interface GalleryItem extends UploadedAsset {
  id: string;
  type: GalleryMediaType;
  caption?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface ProProfile {
  userId: string;
  businessName: string;
  bio: string;
  category: string;
  services: string[];
  serviceAreas: string[];
  yearsExperience: number;
  status: ProStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTimeHours: number;
  logoUrl?: string;
  coverUrl?: string;
  identityDocument?: IdentityDocument;
  gallery?: GalleryItem[];
  socials?: SocialLink[];
  subscription: {
    status: SubStatus;
    plan?: string;
    renewsAt?: string;
  };
}

export type RequestStatus = "open" | "in_progress" | "hired" | "closed";

export interface ServiceRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  city: string;
  address?: string;
  urgency: "flexible" | "this_week" | "asap";
  status: RequestStatus;
  attachments: string[];
  createdAt: string;
  hiredProId?: string;
}

export type DealStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Deal {
  id: string;
  requestId: string;
  proId: string;
  message: string;
  quote: number;
  etaDays: number;
  status: DealStatus;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  leadsPerMonth: number | "unlimited";
  features: string[];
  highlighted?: boolean;
}

export interface Invoice {
  id: string;
  proId: string;
  amount: number;
  status: "paid" | "due" | "failed";
  date: string;
  plan: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "deal_new" | "deal_accepted" | "deal_rejected" | "request_matched" | "subscription" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved";
  createdAt: string;
}
