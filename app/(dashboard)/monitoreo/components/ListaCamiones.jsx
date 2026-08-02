"use client";

import { Truck, Navigation, Clock } from "lucide-react";

export default function ListaCamiones({ datos, idSeleccionado, onSeleccionar }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No hay camiones con posición registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {datos.map((item) => {
        const pos = item.posicion;
        const nombreRuta = item.nombreRuta;
        const asignacion = item.idAsignacion;
        const conductor = item.nombresUsuario;
        const seleccionado = idSeleccionado === asignacion;

        return (
          <div
            key={item.idAsignacion}
            onClick={() => onSeleccionar?.(item)}
            className={`bg-white border rounded-xl p-3 shadow-sm hover:border-[#40916C] transition-colors cursor-pointer ${
              seleccionado ? "border-[#40916C] ring-2 ring-[#40916C]/30" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#D8F3DC] flex items-center justify-center text-[var(--ColorVerdeHover)]">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm font-bold truncate max-w-[200px]">
                    <span>Asignación:</span>
                    <span className="text-[var(--ColorVerdeHover)] font-normal ml-1 truncate">#{asignacion}</span>
                  </div>
                  <div className="flex items-center text-sm font-bold truncate max-w-[200px]">
                    <span>Ruta:</span>
                    <span className="text-[var(--ColorVerdeHover)] font-normal ml-1 truncate">{nombreRuta} </span>
                  </div>
                  <div className="flex items-center text-sm font-bold truncate max-w-[200px]">
                    <span>Conductor:</span>
                    <span className="text-[var(--ColorVerdeHover)] font-normal ml-1 truncate">{conductor}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {pos.velocidad ? `${pos.velocidad} km/h` : "Detenido"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                <span>
                  {pos.latitud?.toFixed(4)}, {pos.longitud?.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(pos.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}