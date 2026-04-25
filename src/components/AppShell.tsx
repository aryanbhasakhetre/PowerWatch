import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  Activity,
  Users,
  Map,
  FileText,
  Zap,
  Wrench,
  HardHat,
  Globe,
  Bell,
  LogOut,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any };

const seniorNav: NavItem[] = [
  { to: "/senior", label: "Command Center", icon: Activity },
  { to: "/senior/map", label: "Live Map", icon: Map },
  { to: "/senior/team", label: "Team Tracker", icon: Users },
  { to: "/senior/lines", label: "Line Closures", icon: Zap },
  { to: "/senior/reports", label: "Shift Reports", icon: FileText },
];

const juniorNav: NavItem[] = [
  { to: "/junior", label: "Incidents", icon: Wrench },
];

const publicNav: NavItem[] = [
  { to: "/public", label: "Live Outages", icon: Globe },
  { to: "/public/report", label: "Report a Fault", icon: Bell },
];

export function AppShell({
  persona,
  children,
}: {
  persona: "senior" | "junior" | "public";
  children: ReactNode;
}) {
  const nav =
    persona === "senior" ? seniorNav : persona === "junior" ? juniorNav : publicNav;

  const personaInfo = {
    senior: { title: "OMS Command", role: "Senior Engineer", icon: HardHat },
    junior: { title: "OMS Field", role: "Junior Engineer", icon: Wrench },
    public: { title: "PowerWatch", role: "Consumer Portal", icon: Globe },
  }[persona];

  const Icon = personaInfo.icon;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const initials =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    (persona === "senior" ? "AS" : persona === "junior" ? "RP" : "C");

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar — hidden on mobile for junior/public personas */}
        <aside
          className={cn(
            "hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex",
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">
                {personaInfo.title}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
                {personaInfo.role}
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/senior" &&
                  item.to !== "/public" &&
                  location.pathname.startsWith(item.to));
              const I = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <I className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border px-5 py-4">
            <Link
              to="/"
              className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              ← Switch persona
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3">
              <Link to="/" className="lg:hidden flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold">{personaInfo.title}</span>
              </Link>
              <span className="hidden lg:inline text-xs uppercase tracking-wider text-muted-foreground">
                {personaInfo.role} · State Electricity Board
              </span>
            </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex h-8 items-center gap-2 rounded-full border border-border bg-surface px-2.5 text-[11px] font-medium text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  LIVE
                </div>
                {user && (
                  <button
                    onClick={handleSignOut}
                    title={`Signed in as ${user.email} (${role})`}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign out
                  </button>
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </div>
              </div>
          </header>

          {/* Mobile bottom nav for junior/public */}
          {persona !== "senior" && (
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface lg:hidden">
              {nav.map((item) => {
                const active =
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/");
                const I = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <I className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/"
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
              >
                <HardHat className="h-4 w-4" />
                Switch
              </Link>
            </nav>
          )}

          <div className={cn("flex-1", persona !== "senior" && "pb-16 lg:pb-0")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
