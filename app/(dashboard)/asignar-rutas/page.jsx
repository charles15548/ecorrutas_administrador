"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, User, Truck, CalendarDays, Clock, Plus, Loader2, AlertTriangle } from "lucide-react";
import { listarRutas } from "../../lib/rutas";
import { listarUsuarios } from "../../lib/usuarios";
import { listarRoles } from "../../lib/roles";
import { listarAsignaciones } from "../../lib/rutasAsignar";
import AsignarRutaModal from "./AsignarRutaModal";

const ESTADO_STYLES = {
  Activa: "bg-[#E9F5EE] text-[#1B4332]",
  Pendiente: "bg-amber-50 text-amber-700",
  Finalizada: "bg-neutral-100 text-neutral-500",
};

export default function AsignarRutasPage() {
  const [rutas, setRutas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const conductores = useMemo(() => {
    const conductorRoleIds = roles
      .filter((r) => {
        const n = String(r.nombre ?? "").toLowerCase();
        return n.includes("conductor") || n.includes("chofer");
      })
      .map((r) => r.idRol);

    return usuarios.filter((u) => {
      const userRoleName = String(u.nombreRol ?? u.rol ?? "").toLowerCase();
      const isConductorRoleName =
        userRoleName.includes("conductor") ||
        userRoleName.includes("chofer") ||
        userRoleName.includes("driver");

      return isConductorRoleName || (u.idRol != null && conductorRoleIds.includes(u.idRol));
    });
  }, [usuarios, roles]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rutasData, usuariosData, rolesData, asignacionesData] = await Promise.all([
        listarRutas(),
        listarUsuarios(),
        listarRoles(),
        listarAsignaciones(),
      ]);

      setRutas(Array.isArray(rutasData) ? rutasData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos de asignación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuccess = async (result) => {
    setModalOpen(false);
    setToast(result?.mensaje || "Asignación creada correctamente.");
    await cargarDatos();
  };

  const activas = asignaciones.filter((a) => a.estado === "Activa").length;

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F5EE] text-[#1B4332]">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#14201B]">Asignar rutas</h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-md">
              Cada asignación conecta una ruta de recojo con el conductor que la recorrerá, en
              una fecha y horario determinados.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1B4332] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#163C2D]"
        >
          <Plus className="h-4 w-4" /> Nueva asignación
        </button>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<MapPin className="h-4 w-4" />} label="Rutas registradas" value={rutas.length} />
        <StatCard icon={<User className="h-4 w-4" />} label="Conductores disponibles" value={conductores.length} />
        <StatCard icon={<Truck className="h-4 w-4" />} label="Asignaciones activas" value={activas} />
      </div>

      {/* Lista de asignaciones */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#14201B]">Rutas asignadas</h2>
          <p className="text-sm text-neutral-500 mt-1">Quién recorre cada ruta y cuándo.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando asignaciones...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle className="inline h-4 w-4 mr-2 align-text-bottom" /> {error}
          </div>
        ) : asignaciones.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-[#F8F8F8] px-5 py-14 text-center">
            <p className="text-sm text-neutral-500">Todavía no hay rutas asignadas a ningún conductor.</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1B4332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163C2D]"
            >
              <Plus className="h-4 w-4" /> Crear la primera asignación
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {asignaciones.map((item) => (
              <div
                key={item.idAsignacion}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-[#FCFEFC] p-4"
              >
                <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E9F5EE] text-[#1B4332]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-[#14201B] truncate">
                    {item.nombreRuta || "Ruta sin nombre"}
                  </p>
                </div>

                <div className="hidden sm:flex flex-1 items-center px-2">
                  <div className="w-full border-t-2 border-dashed border-neutral-200" />
                </div>

                <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                    <User className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-[#14201B] truncate">
                    {item.nombresUsuario || "Sin conductor"}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> {item.fechaAsignacion || "-"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {item.horaInicio || "-"}–{item.horaFin || "-"}
                  </span>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    ESTADO_STYLES[item.estado] || "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.estado || "Sin estado"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <AsignarRutaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rutas={rutas}
        conductores={conductores}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F5EE] text-[#1B4332]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-[#14201B]">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}