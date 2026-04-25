import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { juniors, fmtMin } from "@/lib/mock-data";
import { RequireAuth } from "@/components/RequireAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/senior/team")({
  head: () => ({ meta: [{ title: "Team Tracker — PowerWatch" }] }),
  component: () => (
    <RequireAuth role="senior">
      <TeamPage />
    </RequireAuth>
  ),
});

function TeamPage() {
  return (
    <AppShell persona="senior">
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Junior Accountability Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Response-time monitoring with automatic escalation if acknowledgement exceeds 15 minutes.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Engineer</th>
                <th className="px-4 py-3 text-left font-medium">Zone</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Active Incident</th>
                <th className="px-4 py-3 text-right font-medium">Report → Ack</th>
                <th className="px-4 py-3 text-right font-medium">Ack → Arrival</th>
                <th className="px-4 py-3 text-right font-medium">MTTR (last)</th>
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
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {j.avatar}
                        </div>
                        <div className="font-medium">{j.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{j.zone}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {j.activeIncident ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {escalate ? (
                        <span className="font-semibold text-severity-critical">
                          ⚠ {j.pendingAckMinutes}m (escalated)
                        </span>
                      ) : (
                        fmtMin(j.ackMinutes)
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">{fmtMin(j.arrivalMinutes)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold">
                      {fmtMin(j.mttrMinutes)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
