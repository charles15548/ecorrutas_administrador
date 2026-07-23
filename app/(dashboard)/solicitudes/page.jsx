"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ClipboardList, Eye } from "lucide-react";
import Swal from "sweetalert2";

import SolicitudModal from "./SolicitudModal";

import {
  listarSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../../lib/usuarios";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listarSolicitudesPendientes();

      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const filtered = useMemo(() => {
    const textoBusqueda = query.toLowerCase().trim();

    return solicitudes.filter((solicitud) => {
      const nombre = solicitud.nombres ?? "";
      const correo = solicitud.correo ?? "";
      const documento = solicitud.numeroDocumento ?? "";
      const rol =
        solicitud.nombreRol ??
        solicitud.tipoUsuario ??
        "";

      return (
        nombre.toLowerCase().includes(textoBusqueda) ||
        correo.toLowerCase().includes(textoBusqueda) ||
        documento.toLowerCase().includes(textoBusqueda) ||
        rol.toLowerCase().includes(textoBusqueda)
      );
    });
  }, [solicitudes, query]);

  const abrirSolicitud = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (procesando) return;

    setModalOpen(false);
    setSolicitudSeleccionada(null);
  };

  const handleApprove = async (solicitud) => {

  const result = await Swal.fire({
    title: "¿Aprobar solicitud?",
    text: `¿Deseas aprobar la solicitud de ${solicitud.nombres}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, aprobar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#1B4332",
    cancelButtonColor: "#d33",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {

    setProcesando(true);

    await aprobarSolicitud(solicitud.idUsuario);

    await Swal.fire({
      icon: "success",
      title: "Solicitud aprobada",
      text: "El usuario ya puede ingresar al sistema.",
      confirmButtonColor: "#1B4332",
    });

    setModalOpen(false);
    setSolicitudSeleccionada(null);

    await cargarSolicitudes();

  } catch (err) {

    console.error(err);

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo aprobar la solicitud.",
    });

  } finally {

    setProcesando(false);

  }
};

 const handleReject = async (solicitud) => {

  const result = await Swal.fire({
    title: "¿Rechazar solicitud?",
    text: `¿Deseas rechazar la solicitud de ${solicitud.nombres}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {

    setProcesando(true);

    await rechazarSolicitud(solicitud.idUsuario);

    await Swal.fire({
      icon: "success",
      title: "Solicitud rechazada",
      text: "La solicitud fue rechazada correctamente.",
      confirmButtonColor: "#1B4332",
    });

    setModalOpen(false);
    setSolicitudSeleccionada(null);

    await cargarSolicitudes();

  } catch (err) {

    console.error(err);

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo rechazar la solicitud.",
    });

  } finally {

    setProcesando(false);

  }
};

  return (
    <>
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14201B] flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-[#1B4332]" />
            Solicitudes pendientes
          </h1>

          <p className="text-sm text-neutral-500 mt-1">
            Revisa, aprueba o rechaza solicitudes de registro.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 max-w-md focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
          <Search className="h-4 w-4 text-neutral-400 shrink-0" />

          <input
            type="text"
            placeholder="Buscar por nombre, correo o documento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
          />
        </div>

        <span className="ml-auto text-xs text-neutral-400">
          {filtered.length} de {solicitudes.length} solicitudes
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Solicitante
                </th>

                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Documento
                </th>

                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Tipo
                </th>

                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Estado
                </th>

                <th className="text-right font-medium text-neutral-500 px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-neutral-400"
                  >
                    Cargando solicitudes...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-red-500"
                  >
                    <p>{error}</p>

                    <button
                      type="button"
                      onClick={cargarSolicitudes}
                      className="mt-3 text-sm font-medium text-[#1B4332] hover:underline"
                    >
                      Intentar nuevamente
                    </button>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((solicitud) => {
                  const nombreRol =
                    solicitud.nombreRol ??
                    solicitud.tipoUsuario ??
                    "Sin rol";

                  return (
                    <tr
                      key={solicitud.idUsuario}
                      className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(solicitud.nombres ?? "?")
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((nombre) => nombre[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-[#14201B] truncate">
                              {solicitud.nombres || "Sin nombre"}
                            </p>

                            <p className="text-xs text-neutral-400 truncate">
                              {solicitud.correo || "Sin correo"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#14201B]">
                          {solicitud.numeroDocumento || "-"}
                        </p>

                        <p className="text-xs text-neutral-400">
                          {solicitud.tipoDocumento || "Documento"}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-[#E3EAFC] text-[#2C4A9E]">
                          {nombreRol}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                          {solicitud.estadoRegistro || "PENDIENTE"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => abrirSolicitud(solicitud)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            Ver solicitud
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-neutral-400"
                  >
                    No se encontraron solicitudes pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SolicitudModal
        open={modalOpen}
        solicitud={solicitudSeleccionada}
        onClose={cerrarModal}
        onApprove={handleApprove}
        onReject={handleReject}
        procesando={procesando}
      />
    </>
  );
}