import { Severity, severityClasses, severityLabel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SeverityBadge({
  severity,
  flash = false,
  size = "sm",
}: {
  severity: Severity;
  flash?: boolean;
  size?: "sm" | "md";
}) {
  const c = severityClasses(severity);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight",
        c.bg,
        c.border,
        c.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        flash && severity === "critical" && "flash-critical",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {severityLabel[severity]}
    </span>
  );
}
