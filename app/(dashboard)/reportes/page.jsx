"use client";

import { useState, useMemo } from "react";
import ReporteModal, { ESTADO_META, TIPO_META } from "./Reportemodal";
import { Search, Eye, Trash2, FileWarning, ChevronDown, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";

const MOCK_REPORTES = [
  {
    id: "a1b2c3d4-0000-0000-0000-000000000001",
    vecino: "Ana Torres",
    zona: "Sector 3 — Tahuantinsuyo",
    titulo: "Acumulación de basura en esquina",
    descripcion: "Desde hace 4 días hay una pila de bolsas de basura acumuladas en la esquina de Av. Los Olivos con Jr. Lima. El olor es muy fuerte y atrae insectos.",
    tipo_residuo: "inorganico",
    latitud: -11.9876,
    longitud: -77.0621,
    foto_url: "foto1.jpg",
    estado: "recibido",
    atendido_por: null,
    respuesta_admin: null,
    creado_en: "20/06/2026 09:14",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000002",
    vecino: "Carlos Huamán",
    zona: "Sector 1 — Payet",
    titulo: "Residuo peligroso abandonado",
    descripcion: "Se encontraron bidones con líquido desconocido frente al parque principal. Posible residuo de pintura industrial.",
    tipo_residuo: "peligroso",
    latitud: -11.9901,
    longitud: -77.0598,
    foto_url: null,
    estado: "en_proceso",
    atendido_por: "Renzo Quintana",
    respuesta_admin: "Nuestro equipo se ha apersonado al lugar y está coordinando con SIGERSOL para el recojo del material.",
    creado_en: "18/06/2026 14:30",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000003",
    vecino: "Lucía Ramos",
    zona: "Sector 5 — El Ermitaño",
    titulo: "Restos de poda sin recoger",
    descripcion: "Dejé los restos de poda del jardín en la vereda según el cronograma pero el camión no pasó.",
    tipo_residuo: "organico",
    latitud: -12.0015,
    longitud: -77.0544,
    foto_url: "foto3.jpg",
    estado: "resuelto",
    atendido_por: "María Quispe",
    respuesta_admin: "Disculpe el inconveniente. El camión pasará el día de mañana en el turno de la mañana para recoger el material.",
    creado_en: "15/06/2026 08:00",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000004",
    vecino: "Pedro Flores",
    zona: "Sector 2 — Independencia",
    titulo: "Contenedor desbordado",
    descripcion: "El contenedor ubicado en Av. Independencia 450 lleva 3 días sin ser vaciado y ya está desbordado.",
    tipo_residuo: "inorganico",
    latitud: -11.9934,
    longitud: -77.0612,
    foto_url: "foto4.jpg",
    estado: "recibido",
    atendido_por: null,
    respuesta_admin: null,
    creado_en: "21/06/2026 07:45",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000005",
    vecino: "Elena Vargas",
    zona: "Sector 4 — Unificada",
    titulo: "Escombros en vía pública",
    descripcion: "Hay material de construcción (escombros, varillas) botado en la vereda que obstaculiza el paso peatonal.",
    tipo_residuo: "especial",
    latitud: -12.0050,
    longitud: -77.0580,
    foto_url: null,
    estado: "rechazado",
    atendido_por: "María Quispe",
    respuesta_admin: "Este tipo de residuo corresponde al propietario contratarlo para su traslado. Le recomendamos contactar a una empresa gestora de escombros.",
    creado_en: "10/06/2026 16:22",
  },
];

const ESTADO_FILTERS = [
  { value: "todos", label: "Todos" },
  ...Object.entries(ESTADO_META).map(([value, meta]) => ({ value, label: meta.label })),
];

const TIPO_FILTERS = [
  { value: "todos", label: "Todos los tipos" },
  ...Object.entries(TIPO_META).map(([value, meta]) => ({ value, label: meta.label })),
];

const STAT_CHIPS = [
  { key: "recibido",   label: "Recibidos",   icon: AlertTriangle,  bg: "bg-[#E3EAFC]", text: "text-[#2C4A9E]" },
  { key: "en_proceso", label: "En proceso",  icon: Clock,          bg: "bg-[#FFE8CC]", text: "text-[#8A5A00]" },
  { key: "resuelto",   label: "Resueltos",   icon: CheckCircle2,   bg: "bg-[#D8F3DC]", text: "text-[#1B4332]" },
  { key: "rechazado",  label: "Rechazados",  icon: XCircle,        bg: "bg-[#FDE8E8]", text: "text-[#8A0000]" },
];

export default function ReportesPage() {
  const [reportes, setReportes] = useState(MOCK_REPORTES);
  const [query, setQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeReporte, setActiveReporte] = useState(null);

  const filtered = useMemo(() => {
    return reportes.filter((r) => {
      const matchesQuery =
        r.titulo.toLowerCase().includes(query.toLowerCase()) ||
        r.vecino.toLowerCase().includes(query.toLowerCase()) ||
        r.zona.toLowerCase().includes(query.toLowerCase());
      const matchesEstado = estadoFilter === "todos" || r.estado === estadoFilter;
      const matchesTipo = tipoFilter === "todos" || r.tipo_residuo === tipoFilter;
      return matchesQuery && matchesEstado && matchesTipo;
    });
  }, [reportes, query, estadoFilter, tipoFilter]);

  const counts = useMemo(() =>
    reportes.reduce((acc, r) => ({ ...acc, [r.estado]: (acc[r.estado] ?? 0) + 1 }), {}),
  [reportes]);

  const openVer = (reporte) => {
    setActiveReporte(reporte);
    setModalOpen(true);
  };

  const handleResponder = ({ estado, respuesta_admin }) => {
    setReportes((prev) =>
      prev.map((r) =>
        r.id === activeReporte.id ? { ...r, estado, respuesta_admin } : r
      )
    );
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setReportes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
        {/* header */}
        <div className="mb-6"> 
          <h1 className="text-2xl font-bold tracking-tight text-[#14201B] flex items-center gap-2.5">
            <FileWarning className="h-5 w-5 text-[#1B4332]" />
            Reportes ciudadanos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Revisa, responde y gestiona los reportes enviados por vecinos de Independencia
          </p>
        </div>

        {/* stat chips */}
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

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 min-w-[200px] max-w-sm focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, vecino, zona..."
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
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="ml-auto text-xs text-neutral-400">
            {filtered.length} de {reportes.length} reportes
          </span>
        </div>

        {/* table */}
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Reporte</th>
                {/* <th className="text-left font-medium text-neutral-500 px-5 py-3">Vecino</th> */}
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Zona</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Tipo</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Estado</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Fecha</th>
                <th className="text-right font-medium text-neutral-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const estadoMeta = ESTADO_META[r.estado] ?? {};
                const tipoMeta = TIPO_META[r.tipo_residuo] ?? { label: r.tipo_residuo, color: "bg-neutral-100 text-neutral-600" };
                return (
                  <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="font-medium text-[#14201B] truncate">{r.titulo}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{r.descripcion.slice(0, 50)}…</p>
                    </td>
                    {/* <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {r.vecino.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm text-[#14201B] whitespace-nowrap">{r.vecino}</span>
                      </div>
                    </td> */}
                    <td className="px-5 py-3.5 text-sm text-neutral-600 whitespace-nowrap">{r.zona}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${tipoMeta.color}`}>
                        {tipoMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${estadoMeta.color}`}>
                        <span className=" opacity-70" />
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

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-neutral-400">
                    No hay reportes con esos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      <ReporteModal
        open={modalOpen}
        reporte={activeReporte}
        onClose={() => setModalOpen(false)}
        onResponder={handleResponder}
      />
    </>
  );
}
