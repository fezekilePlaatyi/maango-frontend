import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareText,
  PlusCircle,
  Search,
  Tags,
  UserRound,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./PublicNav";
import { Button } from "@/components/ui/button";
import { fetchNotifications, logout, useAppDispatch, useAppSelector } from "@/app/store";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

interface NavItem { to: string; label: string; icon: LucideIcon; }

const nav: Record<Role, NavItem[]> = {
  client: [
    { to: "/app/client/dashboard", label: "Overview", icon: Home },
    { to: "/app/client/requests", label: "My requests", icon: ClipboardList },
    { to: "/app/client/requests/new", label: "Post a request", icon: PlusCircle },
    { to: "/search", label: "Find pros", icon: Search },
  ],
  pro: [
    { to: "/app/pro/dashboard", label: "Overview", icon: Home },
    { to: "/app/pro/matching", label: "Matching leads", icon: BriefcaseBusiness },
    { to: "/app/pro/responses", label: "My responses", icon: MessageSquareText },
    { to: "/app/pro/billing", label: "Billing & plan", icon: CreditCard },
    { to: "/app/profile", label: "Profile & business", icon: UserRound },
  ],
  admin: [
    { to: "/app/admin/dashboard", label: "Overview", icon: Home },
    { to: "/app/admin/applications", label: "Pro applications", icon: ListChecks },
    { to: "/app/admin/users", label: "Users", icon: Users },
    { to: "/app/admin/requests", label: "Requests", icon: ClipboardList },
    { to: "/app/admin/payments", label: "Payments", icon: WalletCards },
    { to: "/app/admin/categories", label: "Categories", icon: Tags },
    { to: "/app/admin/support", label: "Support", icon: LifeBuoy },
  ],
};

export function AppShell() {
  const user = useAppSelector(s => s.auth.user);
  const notifs = useAppSelector(s => s.auth.user ? s.notifications.items : []);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) dispatch(fetchNotifications(user.id));
  }, [user, dispatch]);

  if (!user) return null;
  const items = nav[user.role];
  const unread = notifs.filter(n => !n.read).length;
  const pathname = router.state.location.pathname;
  const activePath = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find(i => pathname === i.to || (i.to !== "/search" && pathname.startsWith(`${i.to}/`)))?.to;

  return (
    <div className="flex min-h-screen bg-background">
      {open && <button className="fixed inset-0 z-30 bg-charcoal/30 backdrop-blur-[1px] md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/60 bg-sidebar shadow-warm transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none",
        open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Logo />
          <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map(i => {
            const active = activePath === i.to;
            const Icon = i.icon;
            return (
              <Link key={i.to} to={i.to} onClick={() => setOpen(false)}
                className={cn("group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-mango-soft text-charcoal font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors",
                  active ? "border-mango/30 bg-gradient-mango text-mango-foreground shadow-warm" : "border-border/70 bg-warm text-mango group-hover:border-mango/30 group-hover:bg-mango-soft")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border/60 p-3">
          <Link
            to="/app/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-mango-soft/60"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-mango font-display text-sm font-semibold text-mango-foreground">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium capitalize text-muted-foreground">{user.role} account</div>
              <div className="truncate text-sm font-semibold text-foreground">{user.name}</div>
            </div>
            <UserRound className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border/60 bg-warm/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden text-sm text-muted-foreground md:block">Welcome, {user.name.split(" ")[0]}</div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/search"><Search className="mr-1 h-4 w-4" />Search</Link></Button>
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/app/notifications" className="relative">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-mango px-1 text-[10px] font-semibold text-mango-foreground">{unread}</span>}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Profile"><Link to="/app/profile"><LayoutDashboard className="h-5 w-5" /></Link></Button>
            <Button variant="warm" size="sm" onClick={() => { dispatch(logout()); router.navigate({ to: "/" }); }}><LogOut className="mr-1 h-4 w-4" />Log out</Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
