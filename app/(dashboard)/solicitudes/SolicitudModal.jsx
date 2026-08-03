"use client";

import { X, CheckCircle2, XCircle } from "lucide-react";

export default function SolicitudModal({
  open,
  solicitud,
  onClose,
  onApprove,
  onReject,
}) {
  if (!open || !solicitud) return null;

 const rol = (
    solicitud.nombreRol ??
    solicitud.tipoUsuario ??
    ""
).toUpperCase();

const esConductor = rol === "CONDUCTOR";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">

        {/* Marca de agua */}
     <img
    src="/logo_ecosmart.png"
    alt=""
    className="
        absolute
        inset-0
        m-auto
        w-72
        opacity-[0.60]
        pointer-events-none
        select-none
        object-contain
    "
/>

        {/* Header */}

        <div className="relative z-10 flex items-center justify-between border-b px-6 py-5 bg-[#F8FCF9]">

          <div>

            <h2 className="text-2xl font-bold text-[#1B4332]">
              Ficha de Verificación
            </h2>

            <p className="text-sm text-neutral-500">
              EcoRuta Smart · Municipalidad de Independencia
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>

        </div>

        {/* Body */}

        <div className="relative z-10 p-6">

          <div className="flex gap-6">

            {/* FOTO */}

            <div className="w-44 h-56 shrink-0">

  <div className="w-full h-full rounded-xl border shadow bg-white overflow-hidden">

                {solicitud.fotoBase64 ? (
<img
    src={`data:image/jpeg;base64,${solicitud.fotoBase64}`}
    alt="Foto"
    className="w-full h-full object-cover rounded-xl"
/>

                ) : (

                  <div className="h-52 flex items-center justify-center text-neutral-400">
                    Sin fotografía
                  </div>

                )}

              </div>

            </div>

            {/* DATOS */}

            <div className="flex-1">

              <div className="
bg-white/90
backdrop-blur
rounded-xl
border-2
border-[#D8F3DC]
shadow-lg
p-6
relative
overflow-hidden
">

                <div className="grid grid-cols-2 gap-5">

                  <Campo titulo="Nombre" valor={solicitud.nombres} />

                  <Campo titulo="Correo" valor={solicitud.correo} />

                  <Campo
                    titulo="Documento"
                    valor={`${solicitud.tipoDocumento ?? ""} : ${solicitud.numeroDocumento ?? ""}`}
                  />

                  <Campo
                    titulo="Tipo Usuario"
                    valor={
                      solicitud.nombreRol ??
                      solicitud.tipoUsuario ??
                      "-"
                    }
                  />

                </div>

                <div className="mt-5">

                  <p className="text-xs text-neutral-500 mb-2">
                    Estado
                  </p>

                  <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 font-semibold">

                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>

                    {solicitud.estadoRegistro}

                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Datos adicionales */}

          <div className="mt-6">

            {esConductor ? (

              <div className="rounded-xl border border-[#40916C] overflow-hidden shadow w-80">

                <div className="bg-[#1B4332] text-white text-center py-2 font-semibold">

                  PLACA SOLICITADA

                </div>

                <div className="bg-white py-6 text-center">

                  <p className="text-5xl font-bold tracking-[10px] text-[#1B4332]">

                    {solicitud.placaSolicitada || "-"}

                  </p>

                </div>

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-5">

                <Campo
                  titulo="Dirección"
                  valor={solicitud.direccion}
                />

                <Campo
                  titulo="Número Catastral"
                  valor={solicitud.numeroCatastral}
                />

                <Campo
                  titulo="Latitud"
                  valor={solicitud.latitud}
                />

                <Campo
                  titulo="Longitud"
                  valor={solicitud.longitud}
                />

              </div>

            )}

          </div>

        </div>

        {/* Footer */}

        <div className="relative z-10 border-t bg-neutral-50 px-6 py-5 flex justify-end gap-3">

          <button
            onClick={() => onReject(solicitud)}
            className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2"
          >
            <XCircle size={18} />
            Rechazar
          </button>

          <button
            onClick={() => onApprove(solicitud)}
            className="h-11 px-6 rounded-xl bg-[#1B4332] hover:bg-[#163C2D] text-white font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Aprobar
          </button>

        </div>

      </div>

    </div>
  );
}

function Campo({ titulo, valor }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 mb-1">
        {titulo}
      </p>

      <p className="font-medium text-[#14201B] break-words whitespace-normal">
        {valor || "-"}
      </p>
    </div>
  );
}