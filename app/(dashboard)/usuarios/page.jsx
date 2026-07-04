"use client";

import { useState, useMemo } from "react";
import UserModal from "./UserModal";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Truck,
  UserRound,
  ChevronDown,
} from "lucide-react";

const ROLE_META = { 
  conductor: { label: "Conductor", icon: Truck, color: "bg-[#FFE8CC] text-[#8A5A00]" },
  ciudadano: { label: "Ciudadano", icon: UserRound, color: "bg-[#E3EAFC] text-[#2C4A9E]" },
};

const MOCK_USERS = [
 
  { id: 2, nombre: "Jorge Pérez", correo: "jperez@ecosmart.pe", telefono: "956 112 233", rol: "conductor", estado: "activo", fecha: "02/04/2026" },
  { id: 3, nombre: "Lucía Ramos", correo: "lramos@gmail.com", telefono: "944 778 102", rol: "ciudadano", estado: "activo", fecha: "18/04/2026" },
  { id: 4, nombre: "Carlos Huamán", correo: "chuaman@ecosmart.pe", telefono: "933 221 445", rol: "conductor", estado: "inactivo", fecha: "25/01/2026" },
  { id: 5, nombre: "Ana Torres", correo: "ana.torres@hotmail.com", telefono: "999 887 766", rol: "ciudadano", estado: "activo", fecha: "05/05/2026" }, 
];

const ROLE_FILTERS = [
  { value: "todos", label: "Todos los roles" }, 
  { value: "conductor", label: "Conductores" },
  { value: "ciudadano", label: "Ciudadanos" },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeUser, setActiveUser] = useState(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.nombre.toLowerCase().includes(query.toLowerCase()) ||
        u.correo.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "todos" || u.rol === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const openCreate = () => {
    setModalMode("create");
    setActiveUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setModalMode("edit");
    setActiveUser(user);
    setModalOpen(true);
  };

  // Mismo handler para crear y editar — solo cambia según modalMode
  const handleSave = (form) => {
    if (modalMode === "create") {
      setUsers((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...form,
          fecha: new Date().toLocaleDateString("es-PE"),
        },
      ]);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === activeUser.id ? { ...u, ...form } : u))
      );
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
        {/* header */}
        <div className="flex items-start justify-between mb-6">
          <div>
             
            <h1 className="text-2xl font-bold tracking-tight text-[#14201B] flex items-center gap-2.5">
              <UsersIcon className="h-5 w-5 text-[#1B4332]" />
              Gestionar usuarios
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Administra cuentas de administradores, conductores y ciudadanos
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-[#1B4332] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 max-w-sm focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none rounded-lg border border-neutral-200 bg-white pl-3.5 pr-9 py-2.5 text-sm text-[#14201B] outline-none focus:border-[#40916C] focus:ring-1 focus:ring-[#40916C] transition-colors cursor-pointer"
            >
              {ROLE_FILTERS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="ml-auto text-xs text-neutral-400">
            {filtered.length} de {users.length} usuarios
          </span>
        </div>

        {/* table */}
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Usuario</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Rol</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Teléfono</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Estado</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Registro</th>
                <th className="text-right font-medium text-neutral-500 px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const meta = ROLE_META[u.rol];
                const RoleIcon = meta.icon;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {u.nombre
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#14201B] truncate">{u.nombre}</p>
                          <p className="text-xs text-neutral-400 truncate">{u.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{u.telefono}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          u.estado === "activo" ? "text-[#1B4332]" : "text-neutral-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.estado === "activo" ? "bg-[#52B788]" : "bg-neutral-300"
                          }`}
                        />
                        {u.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">{u.fecha}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-[#D8F3DC] hover:text-[#1B4332] transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
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
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-neutral-400">
                    No se encontraron usuarios con esos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      {/* mismo modal sirve para crear y editar — solo cambia "modalMode" */}
      <UserModal
        key={`${modalMode}-${activeUser?.id ?? "new"}-${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        mode={modalMode}
        user={activeUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
