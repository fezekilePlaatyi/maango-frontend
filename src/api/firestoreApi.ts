import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { Category, Invoice, Notification, ProProfile, ServiceRequest, User } from "@/types";

const REQUESTS = "maango_service_requests";
const PROFILES = "maango_pro_profiles";
const NOTIFICATIONS = "maango_notifications";
const USERS = "maango_users";
const SUBSCRIPTIONS = "maango_subscriptions";
const INVOICES = "maango_invoices";
const CATEGORIES = "maango_categories";

const defaultCategories: Category[] = [
  { id: "cat_plumbing", name: "Plumbing", slug: "plumbing", icon: "Wrench" },
  { id: "cat_electrical", name: "Electrical", slug: "electrical", icon: "Zap" },
  { id: "cat_cleaning", name: "Cleaning", slug: "cleaning", icon: "Sparkles" },
  { id: "cat_gardening", name: "Gardening", slug: "gardening", icon: "Leaf" },
  { id: "cat_painting", name: "Painting", slug: "painting", icon: "Paintbrush" },
];

type RegisterInput = {
  id?: string;
  email: string;
  name: string;
  role: User["role"];
  identityDocument?: ProProfile["identityDocument"];
};

const identityDocumentTypes = new Set(["sa_id", "passport"]);
const identityContentTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function clean<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function searchTokens(value?: string) {
  const normalized = normalize(value);
  const tokens = new Set([normalized]);
  if (normalized === "plumber" || normalized === "plumbers") tokens.add("plumbing");
  if (normalized === "electrician" || normalized === "electricians") tokens.add("electrical");
  if (normalized === "cleaner" || normalized === "cleaners") tokens.add("cleaning");
  if (normalized === "gardener" || normalized === "gardeners") tokens.add("gardening");
  if (normalized === "painter" || normalized === "painters") tokens.add("painting");
  return [...tokens].filter(Boolean);
}

function uid(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

function validateIdentityDocument(document: ProProfile["identityDocument"]) {
  if (!document) throw new Error("Providers must upload an ID document or passport.");
  if (!identityDocumentTypes.has(document.type)) throw new Error("Identity document type must be SA ID or passport.");
  if (!identityContentTypes.has(document.contentType)) throw new Error("Identity document must be a JPG, PNG, WebP, or PDF.");
  if (!Number.isFinite(Number(document.size)) || Number(document.size) <= 0 || Number(document.size) > 10 * 1024 * 1024) {
    throw new Error("Identity document must be smaller than 10MB.");
  }
  if (!String(document.storagePath || "").startsWith("provider-verification/")) {
    throw new Error("Identity document was not uploaded to the provider verification folder.");
  }
  if (!document.url || !document.name || !document.uploadedAt) throw new Error("Identity document upload metadata is incomplete.");
}

export async function saveUserProfile(user: User) {
  await setDoc(doc(firestore, USERS, user.id), clean(user), { merge: true });
}

export async function updateUserProfile(id: string, patch: Partial<User>): Promise<User> {
  await setDoc(doc(firestore, USERS, id), clean(patch), { merge: true });
  const user = await getUserProfile(id);
  if (!user) throw new Error("User profile not found");
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await getDocs(query(collection(firestore, USERS), where("email", "==", email), limit(1)));
  return snap.empty ? null : snap.docs[0].data() as User;
}

export async function getUserProfile(id: string): Promise<User | null> {
  const snap = await getDoc(doc(firestore, USERS, id));
  return snap.exists() ? snap.data() as User : null;
}

export async function listUsers(): Promise<User[]> {
  const snap = await getDocs(collection(firestore, USERS));
  return snap.docs.map(d => d.data() as User);
}

export async function registerUser(input: RegisterInput): Promise<User> {
  if (!input.email || !input.name || !input.role) throw new Error("Email, name and role are required");
  if (!["client", "pro", "admin"].includes(input.role)) throw new Error("Invalid role");
  if (input.role === "pro") validateIdentityDocument(input.identityDocument);

  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const user: User = {
    id: input.id || uid("u"),
    email,
    name: input.name.trim(),
    role: input.role,
    createdAt: new Date().toISOString(),
  };

  await saveUserProfile(user);

  if (user.role === "pro") {
    await saveProProfile({
      userId: user.id,
      businessName: user.name,
      bio: "",
      category: "plumbing",
      services: [],
      serviceAreas: [],
      yearsExperience: 0,
      status: "draft",
      verified: false,
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      responseTimeHours: 0,
      identityDocument: input.identityDocument,
      subscription: { status: "none" },
    });
  }

  return user;
}

export async function saveProProfile(profile: ProProfile) {
  await setDoc(doc(firestore, PROFILES, profile.userId), clean(profile), { merge: true });
}

export async function cancelProSubscription(proId: string): Promise<ProProfile["subscription"]> {
  const canceledAt = new Date().toISOString();
  const subscription = { status: "none" as const };
  await Promise.all([
    setDoc(doc(firestore, PROFILES, proId), {
      subscription: {
        status: "none",
        plan: deleteField(),
        renewsAt: deleteField(),
        provider: deleteField(),
        providerToken: deleteField(),
        canceledAt,
      },
    }, { merge: true }),
    setDoc(doc(firestore, SUBSCRIPTIONS, proId), {
      proId,
      status: "none",
      plan: deleteField(),
      renewsAt: deleteField(),
      providerToken: deleteField(),
      canceledAt,
    }, { merge: true }),
  ]);
  return subscription;
}

export async function listInvoices(proId: string): Promise<Invoice[]> {
  const snap = await getDocs(query(collection(firestore, INVOICES), where("proId", "==", proId)));
  return snap.docs
    .map(d => d.data() as Invoice)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function listAllInvoices(): Promise<Invoice[]> {
  const snap = await getDocs(collection(firestore, INVOICES));
  return snap.docs
    .map(d => d.data() as Invoice)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function getProProfile(userId: string): Promise<ProProfile | null> {
  const snap = await getDoc(doc(firestore, PROFILES, userId));
  return snap.exists() ? snap.data() as ProProfile : null;
}

export async function listProProfiles(): Promise<ProProfile[]> {
  const snap = await getDocs(collection(firestore, PROFILES));
  return snap.docs.map(d => ({ userId: d.id, ...d.data() }) as ProProfile);
}

export async function searchProProfiles(q: { category?: string; city?: string; text?: string } = {}): Promise<ProProfile[]> {
  const snap = await getDocs(query(collection(firestore, PROFILES), where("status", "==", "approved")));
  const text = String(q.text || "").trim().toLowerCase();
  const tokens = searchTokens(q.text);
  const city = String(q.city || "").trim().toLowerCase();
  const category = normalize(q.category);

  return snap.docs
    .map(d => d.data() as ProProfile)
    .filter(pro => {
      if (category && normalize(pro.category) !== category) return false;
      if (city && !(pro.serviceAreas || []).some(area => area.toLowerCase().includes(city))) return false;
      if (text) {
        const haystack = `${pro.businessName || ""} ${pro.bio || ""} ${pro.category || ""} ${(pro.services || []).join(" ")}`.toLowerCase();
        const normalizedHaystack = normalize(haystack);
        if (!haystack.includes(text) && !tokens.some(token => normalizedHaystack.includes(token))) return false;
      }
      return true;
    });
}

export async function listCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(firestore, CATEGORIES));
  const categories = snap.docs.map(d => d.data() as Category);
  return categories.length > 0 ? categories : defaultCategories;
}

export async function saveServiceRequest(request: ServiceRequest) {
  await setDoc(doc(firestore, REQUESTS, request.id), clean(request), { merge: true });
}

export async function getServiceRequest(id: string): Promise<ServiceRequest | null> {
  const snap = await getDoc(doc(firestore, REQUESTS, id));
  return snap.exists() ? snap.data() as ServiceRequest : null;
}

export async function listClientRequests(clientId: string): Promise<ServiceRequest[]> {
  const snap = await getDocs(query(collection(firestore, REQUESTS), where("clientId", "==", clientId)));
  return snap.docs.map(d => d.data() as ServiceRequest);
}

export async function listOpenRequestsByCategory(category: string): Promise<ServiceRequest[]> {
  const snap = await getDocs(query(
    collection(firestore, REQUESTS),
    where("status", "==", "open"),
  ));
  return snap.docs
    .map(d => d.data() as ServiceRequest)
    .filter(request => request.category === category);
}

export async function listAllRequests(): Promise<ServiceRequest[]> {
  const snap = await getDocs(collection(firestore, REQUESTS));
  return snap.docs
    .map(d => d.data() as ServiceRequest)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function setRequestHired(requestId: string, proId: string) {
  await updateDoc(doc(firestore, REQUESTS, requestId), {
    status: "hired",
    hiredProId: proId,
  });
}

export async function createNotification(notification: Notification) {
  await setDoc(doc(firestore, NOTIFICATIONS, notification.id), clean(notification), { merge: true });
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const snap = await getDocs(query(collection(firestore, NOTIFICATIONS), where("userId", "==", userId)));
  return snap.docs.map(d => d.data() as Notification).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(firestore, NOTIFICATIONS, id), { read: true });
}
