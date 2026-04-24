import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Wrench, Globe, Activity, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OMS — Outage Management System" },
      {
        name: "description",
        content:
          "Real-time outage management platform connecting field engineers, command centers, and citizens.",
      },
      { property: "og:title", content: "OMS — Outage Management System" },
      {
        property: "og:description",
        content:
          "Real-time outage management platform connecting field engineers, command centers, and citizens.",
      },
    ],
  }),
  component: Index,
});

const personas = [
  {
    to: "/senior",
    icon: HardHat,
    title: "Senior Engineer",
    subtitle: "Command Center",
    desc: "Live grid map, junior accountability, line closures, and shift reports.",
  },
  {
    to: "/junior",
    icon: Wrench,
    title: "Junior Engineer",
    subtitle: "Field App",
    desc: "Assigned incident feed, proof-of-work upload, GPS-verified status workflow.",
  },
  {
    to: "/public",
    icon: Globe,
    title: "Citizen",
    subtitle: "Public Portal",
    desc: "Track outages near you, report faults with photos, follow restoration progress.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">OMS Platform</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                State Electricity Board
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3 w-3" />
            Outage Management System
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
            One grid. Three views.
            <br />
            <span className="text-muted-foreground">Zero blind spots.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Bridging field engineers, senior management and the public on a single
            real-time platform. Choose your role to enter the system.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {personas.map((p) => {
            const I = p.icon;
            return (
              <Link
                key={p.to}
                to={p.to}
                className="group relative flex flex-col rounded-xl border border-border bg-surface p-6 transition-all hover:border-border-strong hover:shadow-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                  <I className="h-5 w-5" />
                </div>
                <div className="mt-5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {p.subtitle}
                  </div>
                  <div className="mt-0.5 text-lg font-semibold tracking-tight">
                    {p.title}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                <div className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  Open dashboard
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 grid gap-6 rounded-xl border border-border bg-surface p-6 md:grid-cols-3">
          <Stat label="Active incidents" value="6" trend="2 critical" />
          <Stat label="Mean time to repair" value="38m" trend="↓ 12% vs avg" />
          <Stat label="Affected consumers" value="14,962" trend="across 5 zones" />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-[11px] uppercase tracking-wider text-muted-foreground">
          OMS v1.0 · Real-time grid intelligence
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{trend}</div>
    </div>
  );
}
