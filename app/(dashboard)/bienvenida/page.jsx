"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Map,
  Radar, 
  FileWarning,
  TrendingUp,
  Truck,  
  Bell,
} from "lucide-react";
 
import { listarRutas } from "../../lib/rutas";  
import { listarUsuarios } from "../../lib/usuarios";
import { listarReportesConductorPendientes } from "../../lib/reporteConductores"; 
import { listarAsignaciones } from "../../lib//rutasAsignar";  

export default function BienvenidaPage() {
  const [stats, setStats] = useState([
    { label: "Rutas Creadas", value: "...", delta: "Total registradas", icon: Map },
    { label: "Rutas Asignadas", value: "...", delta: "En operación", icon: Truck }, // Cambiado de Conductores a Asignadas
    { label: "Usuarios Registrados", value: "...", delta: "Total sistema", icon: Users },
    { label: "Reportes Pendientes", value: "...", delta: "Requieren atención", icon: FileWarning },
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutamos las 4 peticiones en paralelo
        const [rutasRes, usuariosRes, reportesRes, asignacionesRes] = await Promise.all([
          listarRutas(),
          listarUsuarios(),
          listarReportesConductorPendientes(),
          listarAsignaciones()
        ]);

        // Calculamos los valores reales
        const totalRutas = rutasRes?.length || 0;
        const totalUsuarios = usuariosRes?.length || 0;
        const totalAsignaciones = asignacionesRes?.length || 0; // Cantidad de rutas asignadas
        const reportesPendientes = reportesRes?.length || 0;

        setStats([
          { 
            label: "Rutas Creadas", 
            value: totalRutas, 
            delta: "Total registradas",
            icon: Map 
          },
          { 
            label: "Rutas Asignadas", 
            value: totalAsignaciones, 
            delta: "En operación", 
            icon: Truck 
          },
          { 
            label: "Usuarios Registrados", 
            value: totalUsuarios, 
            delta: "Total sistema", 
            icon: Users 
          },
          { 
            label: "Reportes Pendientes", 
            value: reportesPendientes, 
            delta: "Requieren atención", 
            icon: FileWarning 
          },
        ]);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
        setStats(prev => prev.map(s => ({ ...s, value: "Error", delta: "Intente más tarde" })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
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
        {stats.map((s, index) => {
          const Icon = s.icon;
          return (
            <div
              key={index}
              className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-[#D8F3DC] flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-[#1B4332]" strokeWidth={2.25} />
                </div>
                {/* Solo mostramos la flecha si hay datos reales */}
                {!loading && s.value !== "Error" && s.value !== "..." && (
                   <TrendingUp className="h-3.5 w-3.5 text-[#40916C]" />
                )}
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
    </>
  );
}