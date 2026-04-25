import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { severityClasses, timeAgo } from "@/lib/mock-data";
import { useIncidents } from "@/lib/incidents";
import { RequireAuth } from "@/components/RequireAuth";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/senior/lines")({
  head: () => ({ meta: [{ title: "Line Closures — PowerWatch" }] }),
  component: () => (
    <RequireAuth role="senior">
      <LinesPage />
    </RequireAuth>
  ),
});

function LinesPage() {
  const { incidents } = useIncidents();
  const closedLines = incidents
    .filter((i) => i.status !== "restored")
    .map((i) => ({
      id: i.id,
      name: i.feeder,
      voltage: i.voltage,
      severity: i.severity,
      area: i.area,
      affected: i.affectedConsumers,
      since: i.reportedAt,
    }));
  return (
    <AppShell persona="senior">
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Line Closures</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active line closures color-coded by the severity of the originating fault.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {closedLines.map((l) => {
            const c = severityClasses(l.severity);
            return (
              <div
                key={l.id}
                className={cn(
                  "rounded-lg border bg-surface p-5 transition-colors",
                  c.border,
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold tracking-tight">
                      {l.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {l.area}
                    </div>
                  </div>
                  <SeverityBadge severity={l.severity} flash />
                </div>
                <div className={cn("mt-4 h-1 w-full rounded-full", c.bg)}>
                  <div className={cn("h-1 w-2/3 rounded-full", c.dot)} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                  <Mini label="Voltage" value={l.voltage} />
                  <Mini label="Affected" value={l.affected.toLocaleString()} />
                  <Mini label="Since" value={timeAgo(l.since)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
