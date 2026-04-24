import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle } from "react-leaflet";
import { Incident, severityHex } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export function OutageMap({
  incidents,
  height = 460,
  selectedId,
  onSelect,
}: {
  incidents: Incident[];
  height?: number | string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  // Force re-render to play nice with SSR / hot reload sizing
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="rounded-lg border border-border bg-surface-2"
        style={{ height }}
      />
    );
  }

  const center: [number, number] = [19.13, 72.93];

  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((inc) => {
          const color = severityHex(inc.severity);
          const isSelected = selectedId === inc.id;
          return (
            <div key={inc.id}>
              {/* Glow ring scaled by severity */}
              <Circle
                center={[inc.lat, inc.lng]}
                radius={
                  inc.severity === "critical"
                    ? 1400
                    : inc.severity === "significant"
                      ? 800
                      : 450
                }
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.12,
                  weight: 1,
                  opacity: 0.5,
                }}
              />
              <CircleMarker
                center={[inc.lat, inc.lng]}
                radius={isSelected ? 11 : 8}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 1,
                }}
                eventHandlers={{
                  click: () => onSelect?.(inc.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <div className="text-xs">
                    <div className="font-semibold">{inc.code} · {inc.feeder}</div>
                    <div className="text-muted-foreground">{inc.title}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider" style={{ color }}>
                      {inc.severity} · {inc.affectedConsumers.toLocaleString()} affected
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
