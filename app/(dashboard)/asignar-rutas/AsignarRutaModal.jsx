"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  MapPin,
  User,
  Truck,
  CalendarDays,
  Clock,
  Search,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { crearAsignacion } from "../../lib/rutasAsignar";

const ESTADOS = [
  { value: "Activa", label: "Activa", hint: "El conductor ya puede iniciar la ruta" },
  { value: "Pendiente", label: "Pendiente", hint: "Se activará más adelante" },
  { value: "Finalizada", label: "Finalizada", hint: "La ruta ya se completó" },
];

const STEPS = [
  { id: 1, label: "Ruta" },
  { id: 2, label: "Conductor" },
  { id: 3, label: "Confirmar" },
];

function initialesDe(nombre) {
  if (!nombre) return "?";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Modal de asignación de rutas.
 * Se importa y controla desde la página principal:
 *   <AsignarRutaModal open={modalOpen} onClose={...} rutas={...} conductores={...} onSuccess={...} />
 */
export default function AsignarRutaModal({ open, onClose, rutas, conductores, onSuccess }) {
  const [step, setStep] = useState(1);
  const [idRuta, setIdRuta] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null);
  const [fechaAsignacion, setFechaAsignacion] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [estado, setEstado] = useState("Activa");
  const [buscarRuta, setBuscarRuta] = useState("");
  const [buscarConductor, setBuscarConductor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reinicia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setStep(1);
      setIdRuta(null);
      setIdUsuario(null);
      setFechaAsignacion(new Date().toISOString().slice(0, 10));
      setHoraInicio("08:00");
      setHoraFin("12:00");
      setEstado("Activa");
      setBuscarRuta("");
      setBuscarConductor("");
      setSaving(false);
      setError(null);
    }
  }, [open]);

  const rutaSeleccionada = useMemo(
    () => rutas.find((r) => r.idRuta === idRuta) || null,
    [rutas, idRuta]
  );
  const conductorSeleccionado = useMemo(
    () => conductores.find((c) => c.idUsuario === idUsuario) || null,
    [conductores, idUsuario]
  );

  const rutasFiltradas = useMemo(() => {
    const q = buscarRuta.trim().toLowerCase();
    if (!q) return rutas;
    return rutas.filter((r) => (r.nombre ?? "").toLowerCase().includes(q));
  }, [rutas, buscarRuta]);

  const conductoresFiltrados = useMemo(() => {
    const q = buscarConductor.trim().toLowerCase();
    if (!q) return conductores;
    return conductores.filter(
      (c) =>
        (c.nombres ?? "").toLowerCase().includes(q) ||
        (c.correo ?? "").toLowerCase().includes(q)
    );
  }, [conductores, buscarConductor]);

  if (!open) return null;

  const elegirRuta = (r) => {
    setIdRuta(r.idRuta);
    setStep(2);
  };

  const elegirConductor = (c) => {
    setIdUsuario(c.idUsuario);
    setStep(3);
  };

  const handleCrear = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await crearAsignacion({
        idRuta,
        idUsuario,
        fechaAsignacion,
        horaInicio,
        horaFin,
        estado,
      });

      if (result?.idAsignacion) {
        onSuccess?.(result);
      } else {
        throw new Error(result?.mensaje || "No se pudo crear la asignación.");
      }
    } catch (err) {
      setError(err?.message || "No se pudo guardar la asignación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#14201B]">Nueva asignación</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Conecta una ruta con el conductor que la recorrerá.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 px-6 pt-5">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === s.id
                    ? "bg-[#1B4332] text-white"
                    : step > s.id
                    ? "bg-[#D8F3DC] text-[#1B4332]"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step >= s.id ? "text-[#14201B]" : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-px flex-1 ${
                    step > s.id ? "bg-[#40916C]" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Cuerpo */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Paso 1: elegir ruta */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2.5">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={buscarRuta}
                  onChange={(e) => setBuscarRuta(e.target.value)}
                  placeholder="Buscar ruta por nombre..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              {rutasFiltradas.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">
                  No hay rutas que coincidan con la búsqueda.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {rutasFiltradas.map((r) => (
                    <button
                      key={r.idRuta}
                      type="button"
                      onClick={() => elegirRuta(r)}
                      className="flex flex-col items-start gap-1 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-[#40916C] hover:bg-[#F3FAF6]"
                    >
                      <div className="flex items-center gap-2 text-[#1B4332]">
                        <MapPin className="h-4 w-4" />
                        <span className="font-semibold text-[#14201B]">{r.nombre}</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {r.distanciaMetros ? `${r.distanciaMetros} m` : "Distancia no definida"} ·{" "}
                        {r.duracionSegundos
                          ? `${Math.ceil(r.duracionSegundos / 60)} min`
                          : "Duración no definida"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 2: elegir conductor */}
          {step === 2 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-[#1B4332]"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Cambiar ruta
              </button>

              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2.5">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={buscarConductor}
                  onChange={(e) => setBuscarConductor(e.target.value)}
                  placeholder="Buscar conductor por nombre o correo..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              {conductoresFiltrados.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">
                  No hay conductores que coincidan con la búsqueda.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {conductoresFiltrados.map((c) => (
                    <button
                      key={c.idUsuario}
                      type="button"
                      onClick={() => elegirConductor(c)}
                      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-[#40916C] hover:bg-[#F3FAF6]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E9F5EE] text-sm font-bold text-[#1B4332]">
                        {initialesDe(c.nombres)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#14201B]">{c.nombres}</p>
                        <p className="text-xs text-neutral-500">{c.correo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 3: confirmar */}
          {step === 3 && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-[#1B4332]"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Cambiar conductor
              </button>

              {/* Conector visual: ruta -> conductor */}
              <div className="flex items-center gap-3 rounded-3xl border border-[#D8F3DC] bg-[#F3FAF6] p-5">
                <div className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1B4332] shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#14201B]">{rutaSeleccionada?.nombre}</p>
                </div>

                <div className="relative flex h-6 flex-[1.4] items-center">
                  <div className="w-full border-t-2 border-dashed border-[#40916C]" />
                  <Truck className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-[#1B4332]" />
                </div>

                <div className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1B4332] shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#14201B]">{conductorSeleccionado?.nombres}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1.5 text-sm text-neutral-700">
                  Fecha
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2.5">
                    <CalendarDays className="h-4 w-4 text-neutral-400" />
                    <input
                      type="date"
                      value={fechaAsignacion}
                      onChange={(e) => setFechaAsignacion(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="space-y-1.5 text-sm text-neutral-700">
                  Hora inicio
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2.5">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="space-y-1.5 text-sm text-neutral-700">
                  Hora fin
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2.5">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-neutral-700">Estado</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ESTADOS.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setEstado(e.value)}
                      className={`rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                        estado === e.value
                          ? "border-[#40916C] bg-[#E9F5EE]"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#14201B]">{e.label}</p>
                      <p className="text-xs text-neutral-500">{e.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie con acción final, solo en el paso de confirmación */}
        {step === 3 && (
          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCrear}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1B4332] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163C2D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Crear asignación
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}