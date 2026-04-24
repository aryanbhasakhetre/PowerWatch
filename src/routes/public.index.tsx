import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OutageMap } from "@/components/OutageMap";
import { incidents, severityClasses, statusLabel, timeAgo } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";
import { Bell, MapPin } from "lucide-react";

export const Route = createFileRoute("/public/")({
  head: () => ({
    meta: [
      { title: "Live Outages Near You — PowerWatch" },
      {
        name: "description",
        content: "Track power outages in your area and follow restoration progress in real time.",
      },
    ],
  }),
  component: PublicHome,
});

function PublicHome() {
  return (
    <AppShell persona="public">
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Mumbai · Consumer ID 4471-2840
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Live outages near you
            </h1>
          </div>
          <Link
            to="/public/report"
            className="hidden md:inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Bell className="h-4 w-4" /> Report a fault
          </Link>
        </div>

        {/* Personal status */}
        <div className="mt-5 rounded-lg border border-severity-warning/40 bg-severity-warning-soft p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-severity-warning">
            <span className="h-2 w-2 rounded-full bg-severity-warning" />
            Possible disruption in your area
          </div>
          <div className="mt-1 text-sm text-foreground">
            Bandra LT-03 line is being inspected — 3 citizen reports nearby.
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Crowdsourced heatmap
            </h2>
            <OutageMap
              incidents={incidents.filter((i) => i.status !== "restored")}
              height={420}
            />
            <div className="mt-2 text-[11px] text-muted-foreground">
              Marker intensity reflects number of citizen reports merged into one incident.
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Incidents in progress
            </h2>
            <div className="space-y-2">
              {incidents
                .filter((i) => i.status !== "restored")
                .slice(0, 5)
                .map((i) => (
                  <Link
                    key={i.id}
                    to="/public/$id"
                    params={{ id: i.id }}
                    className="block rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {i.code}
                      </span>
                      <SeverityBadge severity={i.severity} flash />
                    </div>
                    <div className="mt-1 text-sm font-semibold">{i.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {i.area} · {i.citizenReports} reports
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-foreground">
                      {statusLabel[i.status]} · updated {timeAgo(i.reportedAt)}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Recently restored */}
        <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recently restored
        </h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {incidents
            .filter((i) => i.status === "restored")
            .map((i) => {
              const c = severityClasses(i.severity);
              return (
                <div
                  key={i.id}
                  className="rounded-lg border border-severity-restored/40 bg-severity-restored-soft p-4"
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-severity-restored">
                    <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                    Power restored
                  </div>
                  <div className="mt-1 text-sm font-semibold">{i.feeder}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {i.area} · restored {timeAgo(i.restoredAt!)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </AppShell>
  );
}
