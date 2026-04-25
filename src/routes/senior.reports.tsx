import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { juniors, fmtMin, statusLabel, severityLabel, type Incident } from "@/lib/mock-data";
import { useIncidents } from "@/lib/incidents";
import { RequireAuth } from "@/components/RequireAuth";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/senior/reports")({
  head: () => ({ meta: [{ title: "Shift Reports — OMS" }] }),
  component: () => (
    <RequireAuth role="senior">
      <ReportsPage />
    </RequireAuth>
  ),
});

function downloadCSV(incidents: Incident[]) {
  const rows = [
    ["Code", "Title", "Feeder", "Area", "Voltage", "Severity", "Status", "Affected", "Assigned"],
    ...incidents.map((i) => [
      i.code,
      i.title,
      i.feeder,
      i.area,
      i.voltage,
      severityLabel[i.severity],
      statusLabel[i.status],
      String(i.affectedConsumers),
      i.assignedTo ?? "",
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shift-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const { incidents } = useIncidents();
  const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const totalAffected = incidents.reduce((a, b) => a + b.affectedConsumers, 0);
  const restored = incidents.filter((i) => i.status === "restored").length;
  const ackJ = juniors.filter((j) => j.ackMinutes > 0);
  const avgAck = ackJ.length ? ackJ.reduce((a, b) => a + b.ackMinutes, 0) / ackJ.length : 0;
  const mttrJ = juniors.filter((j) => j.mttrMinutes > 0);
  const avgMttr = mttrJ.length ? mttrJ.reduce((a, b) => a + b.mttrMinutes, 0) / mttrJ.length : 0;

  return (
    <AppShell persona="senior">
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Shift Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aggregated outage performance summary — {month}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(incidents)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              <FileText className="h-4 w-4" /> Print PDF
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Total incidents" value={String(incidents.length)} />
          <Stat label="Restored" value={`${restored} / ${incidents.length}`} />
          <Stat label="Avg Ack time" value={fmtMin(Math.round(avgAck))} />
          <Stat label="Avg MTTR" value={fmtMin(Math.round(avgMttr))} />
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-3 text-sm font-semibold">
            Incident summary
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Code</th>
                  <th className="px-4 py-2.5 text-left font-medium">Feeder</th>
                  <th className="px-4 py-2.5 text-left font-medium">Severity</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Affected</th>
                  <th className="px-4 py-2.5 text-left font-medium">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{i.code}</td>
                    <td className="px-4 py-3">{i.feeder}</td>
                    <td className="px-4 py-3 capitalize">{severityLabel[i.severity]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{statusLabel[i.status]}</td>
                    <td className="px-4 py-3 text-right">{i.affectedConsumers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.assignedTo ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border bg-surface-2 px-5 py-2.5 text-right text-sm font-semibold">
            Total affected consumers: {totalAffected.toLocaleString()}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
