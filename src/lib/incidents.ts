import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Incident, Severity, IncidentStatus } from "./mock-data";

type Row = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  feeder: string;
  area: string;
  voltage: string;
  severity: Severity;
  status: IncidentStatus;
  affected_consumers: number;
  citizen_reports: number;
  lat: number;
  lng: number;
  assigned_to: string | null;
  reported_at: string;
  acknowledged_at: string | null;
  arrived_at: string | null;
  restored_at: string | null;
};

function rowToIncident(r: Row, assignedName?: string): Incident {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    description: r.description ?? "",
    feeder: r.feeder,
    area: r.area,
    voltage: r.voltage,
    severity: r.severity,
    status: r.status,
    affectedConsumers: r.affected_consumers,
    citizenReports: r.citizen_reports,
    lat: r.lat,
    lng: r.lng,
    assignedTo: assignedName,
    reportedAt: r.reported_at,
    acknowledgedAt: r.acknowledged_at ?? undefined,
    arrivedAt: r.arrived_at ?? undefined,
    restoredAt: r.restored_at ?? undefined,
  };
}

async function loadAll(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .order("reported_at", { ascending: false });
  if (error || !data) return [];

  const userIds = Array.from(
    new Set(data.map((d: Row) => d.assigned_to).filter(Boolean) as string[]),
  );
  let nameMap = new Map<string, string>();
  if (userIds.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    nameMap = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? ""]));
  }
  return (data as Row[]).map((r) => rowToIncident(r, r.assigned_to ? nameMap.get(r.assigned_to) : undefined));
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadAll().then((d) => {
      if (!alive) return;
      setIncidents(d);
      setLoading(false);
    });

    const ch = supabase
      .channel("incidents-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        async () => {
          const d = await loadAll();
          if (alive) setIncidents(d);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, []);

  return { incidents, loading };
}

export function useIncident(id: string) {
  const [inc, setInc] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        if (alive) {
          setInc(null);
          setLoading(false);
        }
        return;
      }
      let name: string | undefined;
      if ((data as Row).assigned_to) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", (data as Row).assigned_to!)
          .maybeSingle();
        name = p?.full_name ?? undefined;
      }
      if (alive) {
        setInc(rowToIncident(data as Row, name));
        setLoading(false);
      }
    }
    load();
    const ch = supabase
      .channel(`incident-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents", filter: `id=eq.${id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [id]);

  return { incident: inc, loading };
}

export async function updateIncidentStatus(
  id: string,
  patch: Partial<{
    status: IncidentStatus;
    acknowledged_at: string;
    arrived_at: string;
    restored_at: string;
    assigned_to: string;
  }>,
) {
  const { error } = await supabase.from("incidents").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}
