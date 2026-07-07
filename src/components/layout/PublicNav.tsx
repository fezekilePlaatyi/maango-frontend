import { Link, useRouter } from "@tanstack/react-router";
import { BriefcaseBusiness, CircleHelp, LayoutDashboard, LogIn, LogOut, Menu, Rocket, Search } from "lucide-react";
import { useAppDispatch, useAppSelector, logout } from "@/app/store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-xl font-semibold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-mango text-lg">🥭</span>
      <span>Maango</span>
    </Link>
  );
}

export function PublicNav() {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-warm/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4 text-mango" />Find pros
          </Link>
          <Link to="/auth/register" search={{ role: "pro" }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <BriefcaseBusiness className="h-4 w-4 text-mango" />For pros
          </Link>
          <a href="#how" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <CircleHelp className="h-4 w-4 text-mango" />How it works
          </a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/app/dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
              <Button variant="warm" size="sm" onClick={() => { dispatch(logout()); router.navigate({ to: "/" }); }}><LogOut className="h-4 w-4" />Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth/login"><LogIn className="h-4 w-4" />Log in</Link></Button>
              <Button variant="mango" size="sm" asChild><Link to="/auth/register"><Rocket className="h-4 w-4" />Get started</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu"><Menu /></button>
      </div>
      {open && (
        <div className="border-t bg-warm px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/search" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><Search className="h-4 w-4 text-mango" />Find pros</Link>
            <Link to="/auth/register" search={{ role: "pro" }} onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><BriefcaseBusiness className="h-4 w-4 text-mango" />For pros</Link>
            <a href="#how" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><CircleHelp className="h-4 w-4 text-mango" />How it works</a>
            {user
              ? <Link to="/app/dashboard" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><LayoutDashboard className="h-4 w-4 text-mango" />Dashboard</Link>
              : <>
                <Link to="/auth/login" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><LogIn className="h-4 w-4 text-mango" />Log in</Link>
                <Link to="/auth/register" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"><Rocket className="h-4 w-4 text-mango" />Get started</Link>
              </>}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-warm">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Trusted home service pros, on tap. Built for South African neighbourhoods.</p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">For homeowners</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/search">Find a pro</Link></li>
            <li><Link to="/auth/register">Post a request</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">For pros</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth/register" search={{ role: "pro" }}>Join Maango</Link></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">About</a></li>
            <li><a href="#">Support</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Maango. Made with 🥭 in Johannesburg.</div>
    </footer>
  );
}
