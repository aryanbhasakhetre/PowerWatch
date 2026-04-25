import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OutageMap } from "@/components/OutageMap";
import { SeverityBadge } from "@/components/SeverityBadge";
import { RequireAuth } from "@/components/RequireAuth";
import {
  juniors,
  severityClasses,
  fmtMin,
  timeAgo,
  statusLabel,
} from "@/lib/mock-data";
import { useIncidents } from "@/lib/incidents";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Users, Zap, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/senior/")({
  head: () => ({
    meta: [
      { title: "Command Center — OMS" },
      { name: "description", content: "Real-time grid command center for senior engineers." },
    ],
  }),
  component: () => (
    <RequireAuth role="senior">
      <SeniorDashboard />
    </RequireAuth>
  ),
});

function SeniorDashboard() {
  const [selected, setSelected] = useState<string | undefined>();
  const { incidents } = useIncidents();
  const critical = incidents.filter((i) => i.severity === "critical" && i.status !== "restored");
  const totalAffected = incidents
    .filter((i) => i.status !== "restored")
    .reduce((a, b) => a + b.affectedConsumers, 0);
  const escalations = juniors.filter((j) => (j.pendingAckMinutes ?? 0) > 15);
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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live operational picture across all feeders and substations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Last sync · just now
          </div>
        </div>

        {/* KPI strip */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={AlertTriangle}
            label="Active incidents"
            value={incidents.filter((i) => i.status !== "restored").length}
            sub={`${critical.length} critical`}
            tone={critical.length > 0 ? "critical" : "neutral"}
          />
          <Kpi
            icon={Users}
            label="Affected consumers"
            value={totalAffected.toLocaleString()}
            sub="across 5 zones"
          />
          <Kpi
            icon={Zap}
            label="Lines closed"
            value={closedLines.length}
            sub="see closures →"
          />
          <Kpi
            icon={Activity}
            label="Escalations"
            value={escalations.length}
            sub="ack > 15m"
            tone={escalations.length > 0 ? "critical" : "neutral"}
            flash={escalations.length > 0}
          />
        </div>

        {/* Map + side panel */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader title="Live Grid Map" hint="Glow indicates affected radius" />
            <OutageMap
              incidents={incidents.filter((i) => i.status !== "restored")}
              selectedId={selected}
              onSelect={setSelected}
              height={460}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <Legend color="bg-severity-warning" label="Warning" />
              <Legend color="bg-severity-significant" label="Significant" />
              <Legend color="bg-severity-critical" label="Critical (flashing)" />
            </div>
          </div>

          <div>
            <SectionHeader title="Incident Feed" hint={`${incidents.length} total`} />
            <div className="space-y-2">
              {incidents.slice(0, 5).map((i) => {
                const c = severityClasses(i.severity);
                return (
                  <button
                    key={i.id}
                    onClick={() => setSelected(i.id)}
                    className={cn(
                      "group block w-full rounded-lg border bg-surface p-3 text-left transition-colors hover:border-border-strong",
                      selected === i.id ? "border-foreground" : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {i.code}
                        </span>
                      </div>
                      <SeverityBadge severity={i.severity} flash />
                    </div>
                    <div className="mt-1.5 text-sm font-medium leading-tight">
                      {i.title}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {i.feeder} · {i.area}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{statusLabel[i.status]}</span>
                      <span>{timeAgo(i.reportedAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lower row */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Junior Accountability Tracker"
              hint="Auto-escalates if Ack > 15m"
              link="/senior/team"
            />
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Engineer</th>
                    <th className="px-4 py-2.5 text-left font-medium">Zone</th>
                    <th className="px-4 py-2.5 text-left font-medium">Incident</th>
                    <th className="px-4 py-2.5 text-right font-medium">Ack</th>
                    <th className="px-4 py-2.5 text-right font-medium">Arrival</th>
                    <th className="px-4 py-2.5 text-right font-medium">MTTR</th>
                  </tr>
                </thead>
                <tbody>
                  {juniors.map((j) => {
                    const escalate = (j.pendingAckMinutes ?? 0) > 15;
                    return (
                      <tr
                        key={j.id}
                        className={cn(
                          "border-b border-border/60 last:border-b-0",
                          escalate && "flash-critical",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                              {j.avatar}
                            </div>
                            <div>
                              <div className="font-medium">{j.name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {j.status}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{j.zone}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {j.activeIncident ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {escalate ? (
                            <span className="font-semibold text-severity-critical">
                              ⚠ {j.pendingAckMinutes}m
                            </span>
                          ) : (
                            fmtMin(j.ackMinutes)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {fmtMin(j.arrivalMinutes)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {fmtMin(j.mttrMinutes)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <SectionHeader title="Line Closures" hint={`${closedLines.length} active`} link="/senior/lines" />
            <div className="space-y-2">
              {closedLines.map((l) => {
                const c = severityClasses(l.severity);
                return (
                  <div
                    key={l.id}
                    className={cn(
                      "rounded-lg border bg-surface p-3 transition-colors",
                      c.border,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold tracking-tight">
                          {l.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {l.area} · {l.voltage}
                        </div>
                      </div>
                      <SeverityBadge severity={l.severity} flash />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{l.affected.toLocaleString()} consumers</span>
                      <span>since {timeAgo(l.since)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
  flash = false,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub: string;
  tone?: "neutral" | "critical";
  flash?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4",
        tone === "critical" ? "border-severity-critical/40" : "border-border",
        flash && "flash-critical",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "critical" ? "text-severity-critical" : "text-muted-foreground",
          )}
        />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  link,
}: {
  title: string;
  hint?: string;
  link?: string;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </div>
  );
}
