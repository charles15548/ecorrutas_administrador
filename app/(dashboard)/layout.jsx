"use client";

import { useState } from "react";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AdminSidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      {!desktopCollapsed && (
        <AdminSidebar
          variant="desktop"
          onNavigate={() => setMobileOpen(false)}
        />
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar sidebar"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute inset-y-0 left-0">
            <AdminSidebar
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          <button
            type="button"
            aria-label="Cerrar sidebar"
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-[#1B4332]" />
          </button>
        </div>
      )}

      <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1200px] w-full item-center justify-center mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            aria-label="Abrir sidebar"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:border-[#40916C] transition-colors"
          >
            <Menu className="h-4 w-4 text-[#1B4332]" />
          </button>

          <button
            type="button"
            aria-label={desktopCollapsed ? "Mostrar sidebar" : "Ocultar sidebar"}
            onClick={() => setDesktopCollapsed((v) => !v)}
            className="hidden lg:flex h-10 w-10 rounded-full bg-white border border-neutral-200 items-center justify-center hover:border-[#40916C] transition-colors"
          >
            {desktopCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-[#1B4332]" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-[#1B4332]" />
            )}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

