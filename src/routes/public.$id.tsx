import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { incidents, IncidentStatus, statusLabel, timeAgo } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";
import { ArrowLeft, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/public/$id")({
  head: () => ({ meta: [{ title: "Outage Tracker — PowerWatch" }] }),
  loader: ({ params }) => {
    const inc = incidents.find((i) => i.id === params.id);
    if (!inc) throw notFound();
    return { inc };
  },
  component: PublicIncident,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-8 text-center">
        <p>{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm">
      Incident not found. <Link to="/public" className="underline">Back</Link>
    </div>
  ),
});

const flow: { key: IncidentStatus; label: string; tone: string }[] = [
  { key: "verified", label: "Fault Verified", tone: "warning" },
  { key: "dispatched", label: "Crew Dispatched", tone: "significant" },
  { key: "repairing", label: "Repairing", tone: "critical" },
  { key: "restored", label: "Power Restored", tone: "restored" },
];

function PublicIncident() {
  const { inc } = Route.useLoaderData();
  const currentIdx = flow.findIndex((f) => f.key === inc.status);

  return (
    <AppShell persona="public">
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-8">
        <Link
          to="/public"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All outages
        </Link>

        <div className="mt-4 rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-muted-foreground">{inc.code}</div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">{inc.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {inc.area}
                </span>
                <span>{inc.feeder}</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {inc.affectedConsumers.toLocaleString()} affected
                </span>
              </div>
            </div>
            <SeverityBadge severity={inc.severity} flash size="md" />
          </div>
        </div>

        {/* Swiggy-style live progress */}
        <div className="mt-5 rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Restoration progress
          </div>

          <div className="relative mt-6">
            {/* Horizontal track */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-border" />
            <div
              className={cn(
                "absolute left-4 top-4 h-0.5 transition-all",
                inc.status === "restored"
                  ? "bg-severity-restored"
                  : inc.status === "repairing"
                    ? "bg-severity-critical"
                    : inc.status === "dispatched"
                      ? "bg-severity-significant"
                      : "bg-severity-warning",
              )}
              style={{
                width: `calc(${(currentIdx / (flow.length - 1)) * 100}% - 0px)`,
              }}
            />

            <div className="relative grid grid-cols-4 gap-2">
              {flow.map((f, idx) => {
                const done = idx < currentIdx;
                const current = idx === currentIdx;
                const tone = f.tone;
                return (
                  <div key={f.key} className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-surface text-[11px] font-bold relative",
                        done && `border-severity-${tone} text-severity-${tone}`,
                        current && `border-severity-${tone} text-severity-${tone}`,
                        !done && !current && "border-border text-muted-foreground",
                      )}
                    >
                      {done ? "✓" : idx + 1}
                      {current && tone === "critical" && (
                        <span className="pulse-ring border-2 border-severity-critical" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-2 text-[11px] font-semibold leading-tight",
                        (done || current) ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {f.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-md bg-surface-2 p-4 text-sm">
            <div className="font-semibold">
              Current status: {statusLabel[inc.status as keyof typeof statusLabel]}
            </div>
            <p className="mt-1 text-muted-foreground">{inc.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
              <Time label="Reported" value={timeAgo(inc.reportedAt)} />
              {inc.acknowledgedAt && (
                <Time label="Acknowledged" value={timeAgo(inc.acknowledgedAt)} />
              )}
              {inc.arrivedAt && <Time label="Crew on site" value={timeAgo(inc.arrivedAt)} />}
              {inc.restoredAt && <Time label="Restored" value={timeAgo(inc.restoredAt)} />}
            </div>
          </div>

          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            ETA based on crew progress · Updates automatically
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Time({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-0.5 font-semibold text-foreground">{value}</div>
    </div>
  );
}
