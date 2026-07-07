import type { Category, Deal, Invoice, Notification, Plan, ProProfile, ServiceRequest, SupportTicket, User } from "@/types";
import { callFunction, callFunctionWithTimeout } from "./firebaseFunctions";
import * as fsApi from "./firestoreApi";

type Overview = {
  clients: number;
  pros: number;
  activeSubs: number;
  pendingPros: number;
  openRequests: number;
  requests: number;
  revenueMTD: number;
};

function normalizeCategory(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeProProfile(pro: ProProfile): ProProfile {
  return {
    ...pro,
    businessName: pro.businessName || "Service provider",
    bio: pro.bio || "",
    category: pro.category || "plumbing",
    services: Array.isArray(pro.services) ? pro.services : [],
    serviceAreas: Array.isArray(pro.serviceAreas) ? pro.serviceAreas : [],
    yearsExperience: Number.isFinite(Number(pro.yearsExperience)) ? Number(pro.yearsExperience) : 0,
    rating: Number.isFinite(Number(pro.rating)) ? Number(pro.rating) : 0,
    reviewCount: Number.isFinite(Number(pro.reviewCount)) ? Number(pro.reviewCount) : 0,
    completedJobs: Number.isFinite(Number(pro.completedJobs)) ? Number(pro.completedJobs) : 0,
    responseTimeHours: Number.isFinite(Number(pro.responseTimeHours)) ? Number(pro.responseTimeHours) : 24,
    verified: Boolean(pro.verified),
    status: pro.status || "draft",
    subscription: pro.subscription || { status: "none" },
  };
}

export const authApi = {
  session(email: string, _password: string) {
    return callFunction<User>("session", { email }).catch(async () => {
      const user = await fsApi.getUserByEmail(email.trim().toLowerCase());
      if (!user) throw new Error("User not found");
      return user;
    });
  },
  register(input: { id?: string; email: string; name: string; role: User["role"]; identityDocument?: ProProfile["identityDocument"] }) {
    return callFunction<User>("register", input).catch(() => fsApi.registerUser(input));
  },
};

export const usersApi = {
  me(id: string) {
    return callFunction<User>("getCurrentUser", { id }).catch(async () => {
      const user = await fsApi.getUserProfile(id);
      if (!user) throw new Error("User profile not found");
      return user;
    });
  },
  update(id: string, patch: Partial<User>) {
    return callFunction<User>("updateCurrentUser", { id, patch }).catch(() => fsApi.updateUserProfile(id, patch));
  },
};

export const prosApi = {
  async search(q: { category?: string; city?: string; text?: string } = {}) {
    try {
      const results = await callFunctionWithTimeout<ProProfile[]>("searchPros", q);
      if (results.length > 0 || (!q.category && !q.city && !q.text)) return results.map(normalizeProProfile);
      return (await fsApi.searchProProfiles(q)).map(normalizeProProfile);
    } catch {
      return (await fsApi.searchProProfiles(q)).map(normalizeProProfile);
    }
  },
  getById(id: string) {
    return callFunction<ProProfile>("getProById", { id }).catch(async () => {
      const profile = await fsApi.getProProfile(id);
      if (!profile) throw new Error("Provider profile not found");
      return profile;
    }).then(normalizeProProfile);
  },
  async getMine(userId: string) {
    try {
      return await callFunction<ProProfile | null>("getMyPro", { userId });
    } catch {
      return fsApi.getProProfile(userId);
    }
  },
  async application(userId: string, patch: Partial<ProProfile>) {
    try {
      return await callFunction<ProProfile>("submitProApplication", { userId, patch });
    } catch {
      const existing = await fsApi.getProProfile(userId);
      const wasApproved = existing?.status === "approved";
      const profile = {
        userId,
        businessName: "",
        bio: "",
        category: "plumbing",
        services: [],
        serviceAreas: [],
        yearsExperience: 0,
        status: wasApproved ? "approved" as const : "pending" as const,
        verified: false,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        responseTimeHours: 24,
        subscription: { status: "none" as const },
        ...existing,
        ...patch,
        status: wasApproved ? "approved" as const : "pending" as const,
        verified: wasApproved ? true : Boolean(existing?.verified),
      };
      await fsApi.saveProProfile(profile);
      return profile;
    }
  },
  updateProfile(userId: string, patch: Partial<ProProfile>) {
    return fsApi.saveProProfile({ userId, ...patch } as ProProfile).then(() => fsApi.getProProfile(userId) as Promise<ProProfile>);
  },
  listAll() {
    return callFunctionWithTimeout<ProProfile[]>("listPros", {}).catch(() => fsApi.listProProfiles()).then(items => items.map(normalizeProProfile));
  },
  setStatus(userId: string, status: ProProfile["status"]) {
    return callFunction<ProProfile>("approveProApplication", { userId, status });
  },
};

export const requestsApi = {
  create(clientId: string, input: Omit<ServiceRequest, "id" | "clientId" | "createdAt" | "status" | "attachments"> & { attachments?: string[] }) {
    return callFunction<ServiceRequest>("createServiceRequest", {
      clientId,
      input: { ...input, category: normalizeCategory(input.category) },
    });
  },
  listMine(clientId: string) {
    return callFunction<ServiceRequest[]>("listMyRequests", { clientId });
  },
  listMatching(proId: string) {
    return callFunction<ServiceRequest[]>("listMatchingRequests", { proId });
  },
  getById(id: string) {
    return callFunction<ServiceRequest>("getRequestById", { id });
  },
  listAll() {
    return callFunctionWithTimeout<ServiceRequest[]>("listRequests", {}).catch(() => fsApi.listAllRequests());
  },
  setHired(requestId: string, proId: string) {
    return callFunction<ServiceRequest>("setHiredPro", { requestId, proId });
  },
};

export const dealsApi = {
  listForRequest(requestId: string) {
    return callFunction<Deal[]>("listDealsForRequest", { requestId });
  },
  listByPro(proId: string) {
    return callFunction<Deal[]>("listDealsByPro", { proId });
  },
  respond(input: { requestId: string; proId: string; message: string; quote: number; etaDays: number }) {
    return callFunction<Deal>("respondToRequest", input);
  },
};

export const paymentsApi = {
  plans() {
    return callFunction<Plan[]>("listSubscriptionPlans", {});
  },
  subscription(proId: string) {
    return callFunction<ProProfile["subscription"]>("getSubscription", { proId });
  },
  async checkout(proId: string, planId: string) {
    const result = await callFunction<{ checkoutUrl: string; subscription: ProProfile["subscription"] }>("createSubscriptionCheckout", { proId, planId });
    if (typeof window !== "undefined") window.location.assign(result.checkoutUrl);
    return result.subscription;
  },
  async cancel(proId: string) {
    try {
      return await callFunction<ProProfile["subscription"]>("cancelSubscription", { proId });
    } catch {
      return fsApi.cancelProSubscription(proId);
    }
  },
  invoices(proId: string) {
    return callFunction<Invoice[]>("listInvoices", { proId }).catch(() => fsApi.listInvoices(proId));
  },
  listAllInvoices() {
    return callFunctionWithTimeout<Invoice[]>("listAllInvoices", {}).catch(() => fsApi.listAllInvoices());
  },
};

export const notificationsApi = {
  list(userId: string) {
    return callFunction<Notification[]>("listNotifications", { userId });
  },
  markRead(id: string) {
    return callFunction<Notification | undefined | null>("markNotificationRead", { id });
  },
};

export const supportApi = {
  createTicket(userId: string, subject: string, message: string) {
    return callFunction<SupportTicket>("createSupportTicket", { userId, subject, message });
  },
  listMine(userId: string) {
    return callFunction<SupportTicket[]>("listMyTickets", { userId });
  },
  listAll() {
    return callFunction<SupportTicket[]>("listSupportTickets", {});
  },
};

export const adminApi = {
  async overview(): Promise<Overview> {
    const [users, pros, requests, invoices] = await Promise.all([
      callFunctionWithTimeout<User[]>("listUsers", {}).catch(() => fsApi.listUsers()),
      prosApi.listAll(),
      requestsApi.listAll(),
      paymentsApi.listAllInvoices(),
    ]);
    return {
      clients: users.filter((user) => user.role === "client").length,
      pros: pros.length,
      activeSubs: pros.filter((pro) => pro.subscription?.status === "active").length,
      pendingPros: pros.filter((pro) => pro.status === "pending").length,
      openRequests: requests.filter((request) => request.status === "open").length,
      requests: requests.length,
      revenueMTD: invoices.filter((invoice) => invoice.status === "paid").reduce((total, invoice) => total + invoice.amount, 0),
    };
  },
  listUsers() {
    return callFunctionWithTimeout<User[]>("listUsers", {}).catch(() => fsApi.listUsers());
  },
  listCategories() {
    return callFunctionWithTimeout<Category[]>("listCategories", {}, 5000).catch(() => fsApi.listCategories());
  },
  addCategory(name: string, icon = "Wrench") {
    return callFunction<Category>("addCategory", { name, icon });
  },
};
