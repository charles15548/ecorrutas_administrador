"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Trash2, FileWarning, ChevronDown, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import ReporteConductorModal, { ESTADO_META, TIPO_META } from "./ReporteConductorModal";

const MOCK_REPORTES_CONDUCTOR = [
  {
    id: "b2c3d4e5-0000-0000-0000-000000000001",
    conductor: "Jorge Pérez",
    dni: "46781234",
    ruta: "Ruta A — Sector 1",
    placa: "ABC-123",
    titulo: "Falla mecánica en compactadora",
    descripcion: "Durante el recorrido se presentó un fallo en el sistema hidráulico. No se puede compactar y el turno queda comprometido.",
    tipo_reporte: "averia",
    latitud: -11.9922,
    longitud: -77.0601,
    estado: "recibido",
    atendido_por: null,
    respuesta_admin: null,
    creado_en: "22/06/2026 06:35",
  },
  {
    id: "b2c3d4e5-0000-0000-0000-000000000002",
    conductor: "María Quispe",
    dni: "70991122",
    ruta: "Ruta C — Sector 4",
    placa: "KLM-778",
    titulo: "Incidente con vehículo estacionado",
    descripcion: "Un vehículo bloquea el acceso a la calle programada. Se requiere apoyo para coordinar desvío o notificación.",
    tipo_reporte: "incidente",
    latitud: -12.0028,
    longitud: -77.0577,
    estado: "en_proceso",
    atendido_por: "Admin Municipal",
    respuesta_admin: "Recibido. Coordinando con serenazgo para liberar la vía o indicar desvío.",
    creado_en: "19/06/2026 10:10",
  },
  {
    id: "b2c3d4e5-0000-0000-0000-000000000003",
    conductor: "Renzo Quintana",
    dni: "44880011",
    ruta: "Ruta B — Sector 3",
    placa: "JHG-552",
    titulo: "Reclamo por punto de acopio saturado",
    descripcion: "El punto de acopio asignado está saturado y no permite descarga. Solicito indicación de un punto alterno.",
    tipo_reporte: "reclamo",
    latitud: -11.9889,
    longitud: -77.0634,
    estado: "resuelto",
    atendido_por: "Admin Municipal",
    respuesta_admin: "Se habilitó punto alterno temporal en Av. Central. Proceder a descargar ahí.",
    creado_en: "16/06/2026 13:05",
  },
];

const TIPO_FILTERS = [
  { value: "todos", label: "Todos los tipos" },
  ...Object.entries(TIPO_META).map(([value, meta]) => ({ value, label: meta.label })),
];

const STAT_CHIPS = [
  { key: "recibido", label: "Recibidos", icon: AlertTriangle, bg: "bg-[#E3EAFC]", text: "text-[#2C4A9E]" },
  { key: "en_proceso", label: "En proceso", icon: Clock, bg: "bg-[#FFE8CC]", text: "text-[#8A5A00]" },
  { key: "resuelto", label: "Resueltos", icon: CheckCircle2, bg: "bg-[#D8F3DC]", text: "text-[#1B4332]" },
  { key: "rechazado", label: "Rechazados", icon: XCircle, bg: "bg-[#FDE8E8]", text: "text-[#8A0000]" },
];

export default function ReportesConductoresPage() {
  const [reportes, setReportes] = useState(MOCK_REPORTES_CONDUCTOR);
  const [query, setQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeReporte, setActiveReporte] = useState(null);

  const filtered = useMemo(() => {
    return reportes.filter((r) => {
      const q = query.toLowerCase();
      const matchesQuery =
        r.titulo.toLowerCase().includes(q) ||
        r.conductor.toLowerCase().includes(q) ||
        r.ruta.toLowerCase().includes(q) ||
        r.placa.toLowerCase().includes(q);
      const matchesEstado = estadoFilter === "todos" || r.estado === estadoFilter;
      const matchesTipo = tipoFilter === "todos" || r.tipo_reporte === tipoFilter;
      return matchesQuery && matchesEstado && matchesTipo;
    });
  }, [reportes, query, estadoFilter, tipoFilter]);

  const counts = useMemo(() => {
    const c = { recibido: 0, en_proceso: 0, resuelto: 0, rechazado: 0 };
    reportes.forEach((r) => {
      if (c[r.estado] !== undefined) c[r.estado] += 1;
    });
    return c;
  }, [reportes]);

  const openVer = (r) => {
    setActiveReporte(r);
    setModalOpen(true);
  };

  const handleResponder = (payload) => {
    setReportes((prev) =>
      prev.map((r) => (r.id === activeReporte?.id ? { ...r, ...payload, atendido_por: "Admin Municipal" } : r)),
    );
    setModalOpen(false);
  };

  const handleDelete = (id) => setReportes((prev) => prev.filter((r) => r.id !== id));

  return (
    <>
      <div className="px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1B4332]">
              <FileWarning className="h-5 w-5" />
              <p className="text-xs font-mono uppercase tracking-widest text-[#40916C]">Gestión</p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#14201B] mt-1">
              Reportes de conductores
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Revisa y gestiona reportes enviados por recolectores durante su turno
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STAT_CHIPS.map(({ key, label, icon: Icon, bg, text }) => (
            <button
              key={key}
              type="button"
              onClick={() => setEstadoFilter(estadoFilter === key ? "todos" : key)}
              className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-all ${
                estadoFilter === key
                  ? "border-[#1B4332] bg-white shadow-sm"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`h-4 w-4 ${text}`} strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-[#14201B] leading-none">{counts[key] ?? 0}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{label}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 min-w-[200px] max-w-sm focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, conductor, ruta, placa..."
              className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="appearance-none rounded-lg border border-neutral-200 bg-white pl-3.5 pr-9 py-2.5 text-sm text-[#14201B] outline-none focus:border-[#40916C] focus:ring-1 focus:ring-[#40916C] transition-colors cursor-pointer"
            >
              {TIPO_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="ml-auto text-xs text-neutral-400">
            {filtered.length} de {reportes.length} reportes
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Reporte</th>
                {/* <th className="text-left font-medium text-neutral-500 px-5 py-3">Conductor</th> 
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Ruta / Placa</th>*/}
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Tipo</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Estado</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Fecha</th>
                <th className="text-right font-medium text-neutral-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const estadoMeta = ESTADO_META[r.estado] ?? {};
                const tipoMeta =
                  TIPO_META[r.tipo_reporte] ?? { label: r.tipo_reporte, color: "bg-neutral-100 text-neutral-600" };
                return (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="font-medium text-[#14201B] truncate">{r.titulo}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{r.descripcion.slice(0, 50)}…</p>
                    </td>
                    {/* <td className="px-5 py-3.5 text-sm text-neutral-600 whitespace-nowrap">{r.conductor}</td> 
                    <td className="px-5 py-3.5 text-sm text-neutral-600 whitespace-nowrap">
                      {r.ruta} · {r.placa}
                    </td>*/}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${tipoMeta.color}`}>
                        {tipoMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${estadoMeta.color}`}
                      >
                        {estadoMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 whitespace-nowrap">{r.creado_en}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openVer(r)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-[#D8F3DC] hover:text-[#1B4332] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-neutral-400">
                    No hay reportes con esos filtros
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <ReporteConductorModal
        key={`${modalOpen ? "open" : "closed"}-${activeReporte?.id ?? "none"}`}
        open={modalOpen}
        reporte={activeReporte}
        onClose={() => setModalOpen(false)}
        onResponder={handleResponder}
      />
    </>
  );
}

