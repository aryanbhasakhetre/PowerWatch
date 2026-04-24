import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { incidents, severityClasses, statusLabel, timeAgo } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/junior/")({
  head: () => ({ meta: [{ title: "Field Incidents — OMS" }] }),
  component: JuniorFeed,
});

function JuniorFeed() {
  // Pretend the logged-in junior is "Rohan Patil"
  const myIncidents = incidents.filter((i) =>
    ["INC-2841", "INC-2840", "INC-2838"].includes(i.code),
  );
  const others = incidents.filter((i) => !myIncidents.includes(i));

  return (
    <AppShell persona="junior">
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              On Duty · Mumbra Zone
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Hello, Rohan
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Active
            </div>
            <div className="text-lg font-semibold">{myIncidents.length}</div>
          </div>
        </div>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My assignments
        </h2>
        <div className="mt-2 space-y-2">
          {myIncidents.map((i) => (
            <IncidentCard key={i.id} i={i} />
          ))}
        </div>

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Other zones
        </h2>
        <div className="mt-2 space-y-2 opacity-70">
          {others.slice(0, 3).map((i) => (
            <IncidentCard key={i.id} i={i} muted />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function IncidentCard({ i, muted = false }: { i: typeof incidents[number]; muted?: boolean }) {
  const c = severityClasses(i.severity);
  return (
    <Link
      to="/junior/$id"
      params={{ id: i.id }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-surface p-4 transition-colors",
        muted
          ? "pointer-events-none border-border opacity-100"
          : "border-border hover:border-border-strong",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          c.bg,
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full", c.dot)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{i.code}</span>
          <SeverityBadge severity={i.severity} flash />
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold">{i.title}</div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {i.area}
          </span>
          <span>{statusLabel[i.status]}</span>
          <span>{timeAgo(i.reportedAt)}</span>
        </div>
      </div>
      {!muted && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </Link>
  );
}
