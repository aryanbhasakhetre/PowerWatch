import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { incidents, severityClasses, statusLabel, timeAgo } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  MapPin,
  Navigation,
  Wrench,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/junior/$id")({
  head: () => ({ meta: [{ title: "Incident Detail — OMS" }] }),
  loader: ({ params }) => {
    const inc = incidents.find((i) => i.id === params.id);
    if (!inc) throw notFound();
    return { inc };
  },
  component: IncidentDetail,
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
      Incident not found.{" "}
      <Link to="/junior" className="underline">
        Back to feed
      </Link>
    </div>
  ),
});

type Step = "accept" | "arrive" | "repair" | "restore";

function IncidentDetail() {
  const { inc } = Route.useLoaderData();
  const [step, setStep] = useState<Step>("accept");
  const [photo, setPhoto] = useState<string | null>(null);
  const c = severityClasses(inc.severity);

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "accept", label: "Accept Task", icon: CheckCircle2 },
    { key: "arrive", label: "Report Arrival", icon: Navigation },
    { key: "repair", label: "Repair Started", icon: Wrench },
    { key: "restore", label: "Restored", icon: Zap },
  ];

  const stepIdx = steps.findIndex((s) => s.key === step);

  function advance() {
    if (step === "accept") setStep("arrive");
    else if (step === "arrive") {
      if (!photo) {
        alert("Photo proof of fault is mandatory before reporting arrival.");
        return;
      }
      setStep("repair");
    } else if (step === "repair") setStep("restore");
  }

  return (
    <AppShell persona="junior">
      <div className="px-4 py-5 lg:px-8 lg:py-8">
        <Link
          to="/junior"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
        </Link>

        <div className="mt-4 rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-muted-foreground">{inc.code}</div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">{inc.title}</h1>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {inc.area}
                </span>
                <span>{inc.feeder}</span>
                <span>{inc.voltage}</span>
              </div>
            </div>
            <SeverityBadge severity={inc.severity} flash size="md" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{inc.description}</p>
          <div className={cn("mt-4 rounded-md p-3 text-xs font-medium", c.bg, c.text)}>
            {inc.affectedConsumers.toLocaleString()} consumers affected · Reported{" "}
            {timeAgo(inc.reportedAt)}
          </div>
        </div>

        {/* Status workflow */}
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status workflow
          </div>

          <ol className="mt-4 space-y-3">
            {steps.map((s, idx) => {
              const done = idx < stepIdx;
              const current = idx === stepIdx;
              const I = s.icon;
              return (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-md border p-3 transition-colors",
                    done && "border-severity-restored/40 bg-severity-restored-soft",
                    current && "border-foreground bg-surface-2",
                    !done && !current && "border-border bg-surface",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      done
                        ? "bg-severity-restored text-white"
                        : current
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-2 text-muted-foreground",
                    )}
                  >
                    <I className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {done ? "Completed" : current ? "Current step" : "Pending"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Proof of work for arrival step */}
          {step === "arrive" && (
            <div className="mt-5 rounded-md border border-dashed border-border-strong bg-surface-2 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Proof of work · required
              </div>
              {photo ? (
                <div className="mt-3">
                  <img
                    src={photo}
                    alt="fault proof"
                    className="h-44 w-full rounded-md border border-border object-cover"
                  />
                  <button
                    onClick={() => setPhoto(null)}
                    className="mt-2 text-[11px] text-muted-foreground underline"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface p-6 text-sm font-medium transition-colors hover:bg-surface-2">
                  <Camera className="h-4 w-4" />
                  Capture fault photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhoto(URL.createObjectURL(f));
                    }}
                  />
                </label>
              )}
              <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Navigation className="h-3 w-3" /> GPS location verified · 19.187°N, 73.022°E
              </div>
            </div>
          )}

          <button
            onClick={advance}
            disabled={step === "restore"}
            className={cn(
              "mt-5 w-full rounded-md px-4 py-3 text-sm font-semibold transition-colors",
              step === "restore"
                ? "bg-severity-restored-soft text-severity-restored"
                : "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {step === "accept" && "Accept Task"}
            {step === "arrive" && "Report Arrival on Site"}
            {step === "repair" && "Mark Power Restored"}
            {step === "restore" && "✓ Restoration Complete"}
          </button>
        </div>

        <div className="mt-4 text-center text-[11px] text-muted-foreground">
          Currently visible to senior dashboard as: <strong>{statusLabel[inc.status]}</strong>
        </div>
      </div>
    </AppShell>
  );
}
