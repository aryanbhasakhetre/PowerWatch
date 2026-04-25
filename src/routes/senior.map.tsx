import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OutageMap } from "@/components/OutageMap";
import { severityClasses, statusLabel, timeAgo } from "@/lib/mock-data";
import { useIncidents } from "@/lib/incidents";
import { RequireAuth } from "@/components/RequireAuth";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/senior/map")({
  head: () => ({ meta: [{ title: "Live Map — OMS" }] }),
  component: () => (
    <RequireAuth role="senior">
      <MapView />
    </RequireAuth>
  ),
});

function MapView() {
  const { incidents } = useIncidents();
  const [selected, setSelected] = useState<string | undefined>();
  const sel = incidents.find((i) => i.id === selected) ?? incidents[0];

  return (
    <AppShell persona="senior">
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Live Grid Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Color-coded incident markers with affected-radius glow.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OutageMap
              incidents={incidents.filter((i) => i.status !== "restored")}
              selectedId={selected}
              onSelect={setSelected}
              height={620}
            />
          </div>
          <div className="space-y-2">
            {incidents.map((i) => {
              const c = severityClasses(i.severity);
              return (
                <button
                  key={i.id}
                  onClick={() => setSelected(i.id)}
                  className={cn(
                    "block w-full rounded-lg border bg-surface p-3 text-left transition-colors",
                    selected === i.id ? "border-foreground" : "border-border hover:border-border-strong",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {i.code}
                    </span>
                    <SeverityBadge severity={i.severity} flash />
                  </div>
                  <div className="mt-1 text-sm font-medium">{i.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {i.feeder} · {statusLabel[i.status]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {sel && (
          <div className="mt-6 rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground">{sel.code}</div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{sel.title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">
                  {sel.feeder} · {sel.area} · {sel.voltage}
                </div>
              </div>
              <SeverityBadge severity={sel.severity} flash size="md" />
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{sel.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Mini label="Status" value={statusLabel[sel.status]} />
              <Mini label="Affected" value={sel.affectedConsumers.toLocaleString()} />
              <Mini label="Citizen reports" value={String(sel.citizenReports)} />
              <Mini label="Reported" value={timeAgo(sel.reportedAt)} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
