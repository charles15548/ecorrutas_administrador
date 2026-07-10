"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  titulo: string;
  subtitulo?: string;
}

export default function RutaFormHeader({ titulo, subtitulo }: Props) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Link
        href="/rutas"
        aria-label="Volver a la lista"
        className="h-9 w-9 rounded-full bg-white border border-gray-200 hover:border-[#40916C] flex items-center justify-center transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-[#1B4332]" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">{titulo}</h1>
        {subtitulo && <p className="text-sm text-gray-600 mt-0.5">{subtitulo}</p>}
      </div>
    </div>
  );
}