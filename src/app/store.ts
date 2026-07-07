import { configureStore, createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { Deal, Notification, Plan, ProProfile, ServiceRequest, User, Invoice } from "@/types";
import { dealsApi, notificationsApi, paymentsApi, prosApi, requestsApi } from "@/api/realApi";
import { registerWithEmail, signInWithEmail, signInWithGoogle as signInWithGoogleProvider } from "@/api/firebaseAuth";

const AUTH_KEY = "maango.auth.v1";

function loadAuth(): User | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveAuth(u: User | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
}

// ---------- auth ----------
export const login = createAsyncThunk("auth/login", async (input: { email: string; password: string }) => {
  const u = await signInWithEmail(input.email, input.password);
  saveAuth(u);
  return u;
});
export const register = createAsyncThunk("auth/register", async (input: { email: string; password: string; name: string; role: User["role"]; identityDocument?: ProProfile["identityDocument"] }) => {
  const u = await registerWithEmail(input);
  saveAuth(u);
  return u;
});
export const signInWithGoogle = createAsyncThunk("auth/google", async (input: { role?: User["role"]; identityDocument?: ProProfile["identityDocument"] } = {}) => {
  const u = await signInWithGoogleProvider(input.role ?? "client", input.identityDocument);
  saveAuth(u);
  return u;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: loadAuth(), loading: false, error: null as string | null },
  reducers: {
    logout(s) { s.user = null; saveAuth(null); },
    setUser(s, a: PayloadAction<User>) { s.user = a.payload; saveAuth(a.payload); },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, s => { s.loading = true; s.error = null; });
    b.addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    b.addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Login failed"; });
    b.addCase(register.fulfilled, (s, a) => { s.user = a.payload; });
    b.addCase(signInWithGoogle.pending, s => { s.loading = true; s.error = null; });
    b.addCase(signInWithGoogle.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    b.addCase(signInWithGoogle.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Google sign-in failed"; });
  },
});
export const { logout, setUser } = authSlice.actions;

// ---------- requests ----------
export const fetchMyRequests = createAsyncThunk("requests/mine", (clientId: string) => requestsApi.listMine(clientId));
export const fetchMatchingRequests = createAsyncThunk("requests/matching", (proId: string) => requestsApi.listMatching(proId));
export const createRequest = createAsyncThunk("requests/create", (p: { clientId: string; input: Parameters<typeof requestsApi.create>[1] }) => requestsApi.create(p.clientId, p.input));
export const hireProForRequest = createAsyncThunk("requests/hire", (p: { requestId: string; proId: string }) => requestsApi.setHired(p.requestId, p.proId));

const requestsSlice = createSlice({
  name: "requests",
  initialState: { mine: [] as ServiceRequest[], matching: [] as ServiceRequest[], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyRequests.pending, s => { s.loading = true; });
    b.addCase(fetchMyRequests.fulfilled, (s, a) => { s.loading = false; s.mine = a.payload; });
    b.addCase(fetchMatchingRequests.fulfilled, (s, a) => { s.matching = a.payload; });
    b.addCase(createRequest.fulfilled, (s, a) => { s.mine.unshift(a.payload); });
    b.addCase(hireProForRequest.fulfilled, (s, a) => {
      s.mine = s.mine.map(r => r.id === a.payload.id ? a.payload : r);
    });
  },
});

// ---------- deals ----------
export const fetchDealsForRequest = createAsyncThunk("deals/forRequest", (requestId: string) => dealsApi.listForRequest(requestId));
export const fetchMyDeals = createAsyncThunk("deals/mine", (proId: string) => dealsApi.listByPro(proId));
export const respondToRequest = createAsyncThunk("deals/respond", (p: Parameters<typeof dealsApi.respond>[0]) => dealsApi.respond(p));

const dealsSlice = createSlice({
  name: "deals",
  initialState: { byRequest: {} as Record<string, Deal[]>, mine: [] as Deal[] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDealsForRequest.fulfilled, (s, a) => {
      const rid = a.meta.arg;
      s.byRequest[rid] = a.payload;
    });
    b.addCase(fetchMyDeals.fulfilled, (s, a) => { s.mine = a.payload; });
    b.addCase(respondToRequest.fulfilled, (s, a) => {
      s.mine.unshift(a.payload);
      (s.byRequest[a.payload.requestId] ||= []).unshift(a.payload);
    });
  },
});

// ---------- pro ----------
export const fetchMyPro = createAsyncThunk("pro/me", (userId: string) => prosApi.getMine(userId));
export const submitProApp = createAsyncThunk("pro/application", (p: { userId: string; patch: Partial<ProProfile> }) => prosApi.application(p.userId, p.patch));

const proSlice = createSlice({
  name: "pro",
  initialState: { profile: null as ProProfile | null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyPro.pending, s => { s.loading = true; });
    b.addCase(fetchMyPro.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload; });
    b.addCase(submitProApp.fulfilled, (s, a) => { s.profile = a.payload; });
  },
});

// ---------- payments ----------
export const fetchPlans = createAsyncThunk("payments/plans", () => paymentsApi.plans());
export const subscribe = createAsyncThunk("payments/subscribe", (p: { proId: string; planId: string }) => paymentsApi.checkout(p.proId, p.planId));
export const cancelSub = createAsyncThunk("payments/cancel", (proId: string) => paymentsApi.cancel(proId));
export const fetchInvoices = createAsyncThunk("payments/invoices", (proId: string) => paymentsApi.invoices(proId));

const paymentsSlice = createSlice({
  name: "payments",
  initialState: { plans: [] as Plan[], invoices: [] as Invoice[], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlans.fulfilled, (s, a) => { s.plans = a.payload; });
    b.addCase(fetchInvoices.fulfilled, (s, a) => { s.invoices = a.payload; });
  },
});

// ---------- notifications ----------
export const fetchNotifications = createAsyncThunk("notif/list", (userId: string) => notificationsApi.list(userId));
export const markNotifRead = createAsyncThunk("notif/read", (id: string) => notificationsApi.markRead(id));

const notifSlice = createSlice({
  name: "notifications",
  initialState: { items: [] as Notification[] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotifications.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(markNotifRead.fulfilled, (s, a) => {
      if (a.payload) s.items = s.items.map(n => n.id === a.payload.id ? a.payload : n);
    });
  },
});

// ---------- ui ----------
const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true, toast: null as { title: string; kind: "success" | "error" } | null },
  reducers: {
    toggleSidebar(s) { s.sidebarOpen = !s.sidebarOpen; },
    setToast(s, a: PayloadAction<{ title: string; kind: "success" | "error" } | null>) { s.toast = a.payload; },
  },
});
export const { toggleSidebar, setToast } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    requests: requestsSlice.reducer,
    deals: dealsSlice.reducer,
    pro: proSlice.reducer,
    payments: paymentsSlice.reducer,
    notifications: notifSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
