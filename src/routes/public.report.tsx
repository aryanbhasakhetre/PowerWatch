import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Camera, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/public/report")({
  head: () => ({ meta: [{ title: "Report a Fault — PowerWatch" }] }),
  component: ReportFault,
});

function ReportFault() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (submitted) {
    return (
      <AppShell persona="public">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-severity-restored-soft text-severity-restored">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Report submitted</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your report has been merged with 4 nearby reports into incident{" "}
            <span className="font-mono text-foreground">INC-2842</span>. You'll receive
            updates as the crew progresses.
          </p>
          <Link
            to="/public"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            View live tracker
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell persona="public">
      <div className="mx-auto max-w-2xl px-4 py-5 lg:py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Report a fault</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Help your community get power back faster. Photos and GPS make verification instant.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr(null);
            const { error } = await supabase.from("citizen_reports").insert({
              description: desc,
              lat: 19.06,
              lng: 72.836,
              area: "Bandra West",
              reporter_id: user?.id ?? null,
            });
            setBusy(false);
            if (error) setErr(error.message);
            else setSubmitted(true);
          }}
          className="mt-6 space-y-4"
        >
          {/* Photo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Snap fault photo
            </label>
            {photo ? (
              <div className="mt-2">
                <img
                  src={photo}
                  alt="fault"
                  className="h-56 w-full rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="mt-2 text-[11px] text-muted-foreground underline"
                >
                  Retake
                </button>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-surface-2 p-10 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
                <Camera className="h-6 w-6" />
                Tap to capture
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
          </div>

          {/* GPS */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-severity-restored-soft text-severity-restored">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                GPS auto-tagged
              </div>
              <div className="font-medium">19.060°N, 72.836°E · Bandra West</div>
            </div>
            <span className="rounded-full bg-severity-restored-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-severity-restored">
              Verified
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Describe the fault
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, 500))}
              placeholder="e.g. Sparking transformer near the market entrance..."
              rows={4}
              className="mt-2 w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-foreground"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {desc.length}/500
            </div>
          </div>

          {/* Severity hint */}
          <div className="rounded-md border border-severity-warning/40 bg-severity-warning-soft p-3 text-xs">
            <strong>Important:</strong> If you see fire, smoke, or a fallen live wire, call the
            emergency hotline immediately at <span className="font-mono">1912</span>.
          </div>

          <button
            type="submit"
            disabled={!photo || !desc}
            className={cn(
              "w-full rounded-md py-3 text-sm font-semibold transition-colors",
              photo && desc
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-surface-2 text-muted-foreground",
            )}
          >
            Submit report
          </button>
        </form>
      </div>
    </AppShell>
  );
}
