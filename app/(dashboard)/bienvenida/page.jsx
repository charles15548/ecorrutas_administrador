"use client";

import AdminSidebar from "../components/Sidebar";
import {
  Users,
  Map,
  Radar,
  FileWarning,
  TrendingUp,
  Truck,
  Bell,
} from "lucide-react";

// Datos de ejemplo — solo para maquetar el diseño
const STATS = [
  { label: "Rutas activas", value: "12", delta: "+2 hoy", icon: Map },
  { label: "Conductores en línea", value: "8", delta: "de 10 totales", icon: Truck },
  { label: "Reportes pendientes", value: "5", delta: "3 urgentes", icon: FileWarning },
  { label: "Usuarios registrados", value: "1,284", delta: "+34 este mes", icon: Users },
];

const ACTIVITY = [
  { who: "Conductor Pérez", what: "completó la ruta Sector 4 — Independencia", time: "Hace 8 min" },
  { who: "Vecino M. Torres", what: "reportó un punto crítico en Av. Los Olivos", time: "Hace 22 min" },
  { who: "Conductor Quispe", what: "inició la ruta Sector 2 — Tahuantinsuyo", time: "Hace 41 min" },
  { who: "Sistema", what: "asignó automáticamente 2 rutas pendientes", time: "Hace 1 h" },
];

export default function BienvenidaPage() {
  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <AdminSidebar />

      <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1200px]">
        {/* header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#40916C] mb-1">
              Bienvenido
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#14201B]">
              Hola, Admin Municipal 👋
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Esto es lo que está pasando en Independencia hoy
            </p>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:border-[#40916C] transition-colors shrink-0"
          >
            <Bell className="h-4 w-4 text-[#1B4332]" />
          </button>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-[#D8F3DC] flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-[#1B4332]" strokeWidth={2.25} />
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-[#40916C]" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#14201B]">
                  {s.value}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
                <p className="text-[11px] text-[#40916C] font-medium mt-2">
                  {s.delta}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* map placeholder — CU05 monitoreo en tiempo real */}
          <div className="lg:col-span-3 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#14201B] flex items-center gap-2">
                <Radar className="h-4 w-4 text-[#40916C]" />
                Recolectores en tiempo real
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D8F3DC] text-[#1B4332]">
                CU05
              </span>
            </div>
            <div className="relative h-72 rounded-lg bg-[#EAF2EC] overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #B7D9C2 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <p className="relative text-xs text-[#6B8F7A] font-medium">
                Mapa de rutas — vista de maqueta
              </p>
              {/* fake truck markers */}
              <div className="absolute top-10 left-14 h-7 w-7 rounded-full bg-[#52B788] flex items-center justify-center ring-2 ring-white">
                <Truck className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="absolute bottom-16 right-20 h-7 w-7 rounded-full bg-[#52B788] flex items-center justify-center ring-2 ring-white">
                <Truck className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="absolute top-24 right-32 h-7 w-7 rounded-full bg-[#1B4332] flex items-center justify-center ring-2 ring-white">
                <Truck className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* activity feed */}
          <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-[#14201B] mb-4">
              Actividad reciente
            </h2>
            <div className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#52B788] mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#14201B] leading-snug">
                      <span className="font-semibold">{a.who}</span> {a.what}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}