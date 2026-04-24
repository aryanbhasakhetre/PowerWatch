export type Severity = "warning" | "significant" | "critical";
export type IncidentStatus =
  | "reported"
  | "verified"
  | "dispatched"
  | "repairing"
  | "restored";

export interface Incident {
  id: string;
  code: string; // e.g. INC-2841
  title: string;
  feeder: string;
  area: string;
  voltage: string;
  severity: Severity;
  status: IncidentStatus;
  reportedAt: string; // ISO
  acknowledgedAt?: string;
  arrivedAt?: string;
  restoredAt?: string;
  assignedTo?: string;
  affectedConsumers: number;
  citizenReports: number;
  lat: number;
  lng: number;
  description: string;
}

export interface JuniorEngineer {
  id: string;
  name: string;
  zone: string;
  status: "on-duty" | "en-route" | "on-site" | "off-duty";
  ackMinutes: number; // time from report -> ack
  arrivalMinutes: number; // ack -> arrival
  mttrMinutes: number; // total
  activeIncident?: string;
  avatar: string;
  // pending ack > 15 -> escalate
  pendingAckMinutes?: number;
}

// Mumbai-ish coords — works as a generic state grid view
export const incidents: Incident[] = [
  {
    id: "1",
    code: "INC-2841",
    title: "33kV transmission line snap",
    feeder: "Mumbra Feeder 3",
    area: "Mumbra Sector 12",
    voltage: "33 kV",
    severity: "critical",
    status: "repairing",
    reportedAt: new Date(Date.now() - 42 * 60_000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 36 * 60_000).toISOString(),
    arrivedAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    assignedTo: "Rohan Patil",
    affectedConsumers: 4820,
    citizenReports: 47,
    lat: 19.187,
    lng: 73.022,
    description:
      "Transmission line snapped between towers T-14 and T-15 after high winds. Multi-section closure in effect.",
  },
  {
    id: "2",
    code: "INC-2840",
    title: "Distribution transformer failure",
    feeder: "Andheri East DT-08",
    area: "Andheri East",
    voltage: "11 kV",
    severity: "critical",
    status: "dispatched",
    reportedAt: new Date(Date.now() - 9 * 60_000).toISOString(),
    affectedConsumers: 1240,
    citizenReports: 22,
    lat: 19.119,
    lng: 72.871,
    description: "DT oil leak with smoke reported. Crew dispatched. Awaiting arrival confirmation.",
  },
  {
    id: "3",
    code: "INC-2839",
    title: "11kV feeder trip",
    feeder: "Thane Feeder 7",
    area: "Thane West",
    voltage: "11 kV",
    severity: "significant",
    status: "repairing",
    reportedAt: new Date(Date.now() - 78 * 60_000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 73 * 60_000).toISOString(),
    arrivedAt: new Date(Date.now() - 55 * 60_000).toISOString(),
    assignedTo: "Aisha Khan",
    affectedConsumers: 612,
    citizenReports: 9,
    lat: 19.218,
    lng: 72.978,
    description: "Standard feeder trip, suspected jumper failure on pole #214.",
  },
  {
    id: "4",
    code: "INC-2838",
    title: "LT line sag — minor",
    feeder: "Bandra LT-03",
    area: "Bandra West",
    voltage: "LT",
    severity: "warning",
    status: "verified",
    reportedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    affectedConsumers: 78,
    citizenReports: 3,
    lat: 19.06,
    lng: 72.836,
    description: "Civilian-reported low-hanging line near market. Awaiting field verification.",
  },
  {
    id: "5",
    code: "INC-2837",
    title: "Scheduled maintenance — Powai",
    feeder: "Powai Feeder 2",
    area: "Powai",
    voltage: "11 kV",
    severity: "warning",
    status: "dispatched",
    reportedAt: new Date(Date.now() - 130 * 60_000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 128 * 60_000).toISOString(),
    assignedTo: "Vikram Singh",
    affectedConsumers: 340,
    citizenReports: 0,
    lat: 19.117,
    lng: 72.906,
    description: "Planned maintenance window 14:00–16:30. Lines partially restricted.",
  },
  {
    id: "6",
    code: "INC-2836",
    title: "Substation panel fire — contained",
    feeder: "Vikhroli SS-2",
    area: "Vikhroli",
    voltage: "33 kV",
    severity: "critical",
    status: "repairing",
    reportedAt: new Date(Date.now() - 95 * 60_000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 92 * 60_000).toISOString(),
    arrivedAt: new Date(Date.now() - 70 * 60_000).toISOString(),
    assignedTo: "Karan Mehta",
    affectedConsumers: 7600,
    citizenReports: 88,
    lat: 19.111,
    lng: 72.928,
    description: "Control panel fire contained by station crew. Bus tie open. Major restoration in progress.",
  },
  {
    id: "7",
    code: "INC-2835",
    title: "Restored — Goregaon LT",
    feeder: "Goregaon LT-11",
    area: "Goregaon East",
    voltage: "LT",
    severity: "significant",
    status: "restored",
    reportedAt: new Date(Date.now() - 220 * 60_000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 216 * 60_000).toISOString(),
    arrivedAt: new Date(Date.now() - 198 * 60_000).toISOString(),
    restoredAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    assignedTo: "Neha Joshi",
    affectedConsumers: 410,
    citizenReports: 12,
    lat: 19.165,
    lng: 72.85,
    description: "Faulty cable joint replaced. Power restored to all consumers.",
  },
];

export const juniors: JuniorEngineer[] = [
  {
    id: "je-01",
    name: "Rohan Patil",
    zone: "Mumbra",
    status: "on-site",
    ackMinutes: 6,
    arrivalMinutes: 18,
    mttrMinutes: 0,
    activeIncident: "INC-2841",
    avatar: "RP",
  },
  {
    id: "je-02",
    name: "Aisha Khan",
    zone: "Thane",
    status: "on-site",
    ackMinutes: 5,
    arrivalMinutes: 18,
    mttrMinutes: 0,
    activeIncident: "INC-2839",
    avatar: "AK",
  },
  {
    id: "je-03",
    name: "Vikram Singh",
    zone: "Powai",
    status: "en-route",
    ackMinutes: 2,
    arrivalMinutes: 0,
    mttrMinutes: 0,
    activeIncident: "INC-2837",
    avatar: "VS",
  },
  {
    id: "je-04",
    name: "Devansh Rao",
    zone: "Andheri East",
    status: "on-duty",
    // no ack yet for INC-2840 -> escalate
    ackMinutes: 0,
    arrivalMinutes: 0,
    mttrMinutes: 0,
    activeIncident: "INC-2840",
    pendingAckMinutes: 22,
    avatar: "DR",
  },
  {
    id: "je-05",
    name: "Karan Mehta",
    zone: "Vikhroli",
    status: "on-site",
    ackMinutes: 3,
    arrivalMinutes: 22,
    mttrMinutes: 0,
    activeIncident: "INC-2836",
    avatar: "KM",
  },
  {
    id: "je-06",
    name: "Neha Joshi",
    zone: "Goregaon",
    status: "on-duty",
    ackMinutes: 4,
    arrivalMinutes: 18,
    mttrMinutes: 130,
    avatar: "NJ",
  },
  {
    id: "je-07",
    name: "Sahil Verma",
    zone: "Bandra",
    status: "on-duty",
    ackMinutes: 0,
    arrivalMinutes: 0,
    mttrMinutes: 0,
    activeIncident: "INC-2838",
    pendingAckMinutes: 17,
    avatar: "SV",
  },
];

export const severityLabel: Record<Severity, string> = {
  warning: "Warning",
  significant: "Significant",
  critical: "Critical",
};

export const statusLabel: Record<IncidentStatus, string> = {
  reported: "Reported",
  verified: "Fault Verified",
  dispatched: "Crew Dispatched",
  repairing: "Repairing",
  restored: "Power Restored",
};

export function severityClasses(s: Severity) {
  if (s === "critical")
    return {
      dot: "bg-severity-critical",
      text: "text-severity-critical",
      bg: "bg-severity-critical-soft",
      ring: "ring-severity-critical/30",
      border: "border-severity-critical/40",
    };
  if (s === "significant")
    return {
      dot: "bg-severity-significant",
      text: "text-severity-significant",
      bg: "bg-severity-significant-soft",
      ring: "ring-severity-significant/30",
      border: "border-severity-significant/40",
    };
  return {
    dot: "bg-severity-warning",
    text: "text-severity-warning",
    bg: "bg-severity-warning-soft",
    ring: "ring-severity-warning/30",
    border: "border-severity-warning/40",
  };
}

export function severityHex(s: Severity) {
  if (s === "critical") return "#dc2626";
  if (s === "significant") return "#d97706";
  return "#eab308";
}

export function fmtMin(min: number) {
  if (min <= 0) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function timeAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m ago`;
}

export const closedLines = incidents
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
