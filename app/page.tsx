"use client";
import {login} from "./lib/auth"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, User, Lock, Eye, EyeOff, MapPin } from "lucide-react";

// Route stops for the decorative "live route" graphic on the left panel.
// Coordinates are in a 320x380 space matching the SVG viewBox below.
const STOPS = [
  { x: 54, y: 44, status: "done" },
  { x: 168, y: 96, status: "done" },
  { x: 96, y: 192, status: "active" },
  { x: 206, y: 268, status: "pending" },
  { x: 130, y: 348, status: "pending" },
];

const ROUTE_PATH =
  "M54,44 C120,70 200,70 168,96 C110,124 50,150 96,192 C150,228 230,232 206,268 C176,308 96,310 130,348";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
 
const handleLogin = async () => {
  setError(null);

  try {
    const response = await login(email, password);

    if (response.mensaje !== "Login correcto") {
      setError(response.mensaje);
      return;
    }

    // Guardar datos del usuario
    localStorage.setItem("usuario", JSON.stringify(response));

    // Redireccionar
    router.push("/bienvenida");

  } catch (error) {
    console.error(error);
    setError("Ocurrió un error al iniciar sesión.");
  }
};

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-[#F8F6F0]">
      {/* LEFT — operations panel (desktop only) */}
      <div className="hidden lg:flex relative flex-col gap-20 overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#163C2D] to-[#0F2C22] text-[#F8F6F0] px-20 py-12">
        {/* subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
             
            backgroundSize: "22px 22px",
          }}
        />

        {/* brand mark */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="   flex items-center justify-center  ">
             <img
                src="/logo.jpeg"
                alt="ECO SMART"
                className="w-48 h-auto mx-auto rounded-2xl object-contain "
              />

          </div>
          <div className="pt-10">
            <p className="font-bold tracking-tight text-2xl leading-none">ECO SMART</p>
            <p className="text-[11px] uppercase tracking-widest text-[#95D5B2] mt-0.5">
              Independencia · Lima
            </p>
          </div>
        </div>

        {/* headline + route graphic */}
        <div className="relative z-10 flex items-center justify-between gap-8">
          <div className="flex-1 max-w-[220px]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#95D5B2] mb-3">
              Panel municipal
            </p>
            <h1 className="text-3xl font-bold tracking-tight leading-tight mb-4">
              Centro de operaciones
            </h1>
            <p className="text-sm text-[#CDE7DA] leading-relaxed">
              Gestiona rutas, asigna conductores y supervisa la recolección en
              tiempo real.
            </p>
          </div>

          {/* route svg */}
          <div className="relative w-[170px] h-[200px] shrink-0">
            <svg
              viewBox="0 0 320 380"
              className="absolute inset-0 w-full h-full"
              fill="none"
            >
              <path
                d={ROUTE_PATH}
                stroke="#52B788"
                strokeWidth="3"
                strokeDasharray="8 7"
                strokeLinecap="round"
                opacity="0.55"
              />
              {STOPS.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={s.status === "active" ? 7 : 5.5}
                  fill={
                    s.status === "pending"
                      ? "#1B4332"
                      : s.status === "active"
                      ? "#52B788"
                      : "#95D5B2"
                  }
                  stroke="#F8F6F0"
                  strokeWidth={s.status === "pending" ? 1.5 : 0}
                />
              ))}
            </svg>

            {/* pulsing "current truck" marker on the active stop */}
            <div
              className="absolute"
              style={{
                left: `${(STOPS[2].x / 320) * 100}%`,
                top: `${(STOPS[2].y / 380) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="absolute inset-0 -m-2 rounded-full bg-[#52B788]/40 animate-ping" />
              <div className="relative h-7 w-7 rounded-full bg-[#52B788] flex items-center justify-center ring-2 ring-[#0F2C22]">
                <Truck className="h-3.5 w-3.5 text-[#0F2C22]" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

       
      </div>

      {/* RIGHT — login form */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* compact header for mobile (left panel is hidden below lg) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-[#1B4332] flex items-center justify-center">
            <Truck className="h-5 w-5 text-[#F8F6F0]" strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-bold tracking-tight text-base leading-none text-[#1B4332]">
              ECO SMART
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#40916C] mt-0.5">
              Panel municipal
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          

          <h2 className="text-2xl font-bold tracking-tight text-[#14201B] mb-1">
            Inicia sesión
          </h2>
          <p className="text-sm text-neutral-500 mb-8">
            Ingresa tus credenciales municipales para continuar
          </p>

          <div className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {/* email */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Usuario o correo institucional
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
                <User className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@independencia.gob.pe"
                  className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Contraseña
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 focus-within:border-[#40916C] focus-within:ring-1 focus-within:ring-[#40916C] transition-colors">
                <Lock className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-[#14201B] placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-neutral-400 hover:text-neutral-600 shrink-0"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* remember / forgot 
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-[#40916C] focus:ring-[#40916C]"
                />
                Recordarme
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#1B4332] hover:text-[#40916C] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>*/}

            {/* submit — visual only, no auth logic yet */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-lg bg-[#1B4332] text-[#F8F6F0] font-semibold py-2.5 mt-2 hover:bg-[#163C2D] active:bg-[#0F2C22] transition-colors flex items-center justify-center gap-2"
            >
              Iniciar sesión
              <MapPin className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-400 text-center mt-8 leading-relaxed">
            Acceso restringido a personal autorizado de la
            <br />
            Municipalidad de Independencia
          </p>
        </div>
      </div>
    </div>
  );
}
