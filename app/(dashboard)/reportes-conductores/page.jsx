"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FileWarning, RefreshCcw, Search } from "lucide-react";
import ReporteConductorModal, { ESTADO_META } from "./ReporteConductorModal"; 
import { cambiarEstadoReporteConductor, listarReportesConductor } from "../../lib/reporteConductores";
const STAT_CHIPS = [
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "RESUELTO", label: "Resueltos" },
];

export default function ReportesConductoresPage() {
  const [reportes, setReportes] = useState([]);
  const [query, setQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeReporte, setActiveReporte] = useState(null);

  const fetchReportes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarReportesConductor();
      setReportes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "No se pudo cargar los reportes.");
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reportes.filter((r) => {
      const matchesQuery =
        !q ||
        String(r?.ruta ?? "").toLowerCase().includes(q) ||
        String(r?.descripcion ?? "").toLowerCase().includes(q) ||
        String(r?.idReporteConductor ?? "").toLowerCase().includes(q) ||
        String(r?.tipo ?? "").toLowerCase().includes(q);
      const matchesEstado = estadoFilter === "todos" || r?.estado === estadoFilter;
      return matchesQuery && matchesEstado;
    });
  }, [reportes, query, estadoFilter]);

  const counts = useMemo(
    () => filtered.reduce((acc, r) => ({ ...acc, [r?.estado]: (acc[r?.estado] ?? 0) + 1 }), {}),
    [filtered],
  );

  const openVer = (reporte) => {
    setActiveReporte(reporte);
    setModalOpen(true);
  };

const handleCambiarEstado = async (nuevoEstado) => {
  if (!activeReporte?.idReporteConductor) return;
  try {
    setError(null);
    const actualizado = await cambiarEstadoReporteConductor( 
      activeReporte.idReporteConductor,
      nuevoEstado,
    );
    setReportes((prev) =>
      prev.map((r) =>
        r?.idReporteConductor === activeReporte.idReporteConductor
          ? { ...r, ...actualizado }
          : r,
      ),
    );
    setActiveReporte((prev) => ({ ...prev, ...actualizado }));
  } catch (e) {
    setError(e?.message ?? "No se pudo actualizar el estado.");
  }
};

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#14201B] flex items-center gap-2.5">
          <FileWarning className="h-5 w-5 text-[#1B4332]" />
          Reportes de conductores
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Visualiza y gestiona los reportes enviados por los conductores
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setEstadoFilter("todos")}
          className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-all ${
            estadoFilter === "todos"
              ? "border-[#1B4332] bg-white shadow-sm"
              : "border-neutral-200 bg-white hover:border-neutral-300"
          }`}
        >
          <div className="text-left">
            <p className="text-lg font-bold text-[#14201B] leading-none">{filtered.length}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Todos</p>
          </div>
        </button>

        {STAT_CHIPS.map(({ key, label }) => (
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
            placeholder="Buscar por ruta, descripción, tipo o ID..."
            className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={fetchReportes}
          className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-[#14201B] outline-none hover:border-neutral-300 transition-colors inline-flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin text-neutral-400" : "text-neutral-500"}`} />
          Actualizar
        </button>

        <span className="ml-auto text-xs text-neutral-400">{filtered.length} reportes</span>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/60">
              {/* <th className="text-left font-medium text-neutral-500 px-5 py-3">ID</th> */}
              <th className="text-left font-medium text-neutral-500 px-5 py-3">Ruta</th>
              <th className="text-left font-medium text-neutral-500 px-5 py-3">Tipo</th>
              <th className="text-left font-medium text-neutral-500 px-5 py-3">Descripción</th>
              <th className="text-left font-medium text-neutral-500 px-5 py-3">Estado</th>
              <th className="text-left font-medium text-neutral-500 px-5 py-3">Fecha Reporte</th>
              <th className="text-right font-medium text-neutral-500 px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-neutral-400">
                  Cargando reportes
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((r, index) => {
                const estadoMeta = ESTADO_META[r?.estado] ?? ESTADO_META.DEFAULT;
                return (
                  <tr
        key={r?.idReporteConductor ?? `reporte-${index}`}  // ← Cambia esta línea
        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
      >
                    {/* <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#14201B]">
                        #{r?.idReporteConductor ?? "-"}
                      </p>
                    </td> */}
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="font-medium text-[#14201B] truncate">{r?.ruta || "-"}</p>
                     
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                        {r?.tipo || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[360px]">
                      <p className="text-sm text-neutral-600 line-clamp-2">{r?.descripcion || "-"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${estadoMeta.color}`}
                      >
                        {estadoMeta.label ?? r?.estado ?? "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 whitespace-nowrap">
                      {r?.fechaReporte ? new Date(r.fechaReporte).toLocaleString() : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openVer(r)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-[#D8F3DC] hover:text-[#1B4332] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-neutral-400">
                  No hay reportes con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReporteConductorModal
        key={activeReporte?.idReporteConductor ?? "reporte-conductor-modal"}
        open={modalOpen}
        reporte={activeReporte}
        onClose={() => setModalOpen(false)}
        onCambiarEstado={handleCambiarEstado}
      />
    </>
  );
}