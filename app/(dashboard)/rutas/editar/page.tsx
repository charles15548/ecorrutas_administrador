
"use client";
import { Suspense } from "react";
import Pub from "./Editar"
export default function Page(){
    return (
        <Suspense fallback={<p>Cargando...</p>}>
          <Pub></Pub>
        </Suspense>
    );
}
