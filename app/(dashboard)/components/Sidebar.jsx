"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  Route,
  Radar,
  FileWarning,
  ClipboardList,
  LogOut,
} from "lucide-react";

// Cada item referencia el caso de uso del diagrama (Administrador_Municipal)
const NAV_ITEMS = [
  { cu: null, label: "Bienvenida", href: "/bienvenida", icon: LayoutDashboard },
  { cu: " ", label: "Gestionar usuarios", href: "/usuarios", icon: Users },
  { cu: " ",label: "Solicitudes Pendientes",href: "/solicitudes",icon: ClipboardList,},
  { cu: " ", label: "Gestionar rutas", href: "/rutas", icon: Map },
  { cu: " ", label: "Asignar rutas", href: "/asignar-rutas", icon: Route },
  { cu: " ", label: "Monitorear recolectores", href: "/monitoreo", icon: Radar },
  { cu: " ", label: "Reportes ciudadanos", href: "/reportes", icon: FileWarning },
  { cu: " ", label: "Reportes conductores", href: "/reportes-conductores", icon: FileWarning },
  
];

export default function AdminSidebar({ variant = "desktop", onNavigate } = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const isMobile = variant === "mobile";

  const cerrarSesion = () => {
    try {
      localStorage.removeItem("usuario");
    } catch {
      // Ignorar errores de almacenamiento
    }

    onNavigate?.();
    router.replace("/");
  };

  return (
    <aside
      className={`${
        isMobile ? "flex" : "hidden lg:flex"
      } flex-col w-64 shrink-0 ${isMobile ? "h-dvh" : "h-screen sticky top-0"} bg-[var(--ColorVerdeHover)] text-[#F8F6F0]`}
    >
      {/* brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        
        <div className="leading-none">
          <p className="font-bold tracking-tight text-sm">ECO SMART</p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--ColorVerde)] mt-1">
            Panel municipal
          </p>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                router.push(item.href);
                onNavigate?.();
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-[#40916C] text-[#F8F6F0] font-semibold"
                  : "text-[#CDE7DA] hover:bg-white/5 hover:text-[#F8F6F0]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.cu && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/15" : "bg-white/5 text-[#9FC7B4]"
                  }`}
                >
                  {item.cu}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* user / logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-[var(--ColorVerde)] flex items-center justify-center text-[var(--ColorVerdeHover)] text-xs font-bold shrink-0">
            AM
          </div> 
          <div className="leading-none flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Admin Municipal</p>
            <p className="text-[10px] text-[#9FC7B4] truncate">Independencia, Lima</p>
          </div>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#CDE7DA] hover:bg-white/5 hover:text-[#F8F6F0] transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
