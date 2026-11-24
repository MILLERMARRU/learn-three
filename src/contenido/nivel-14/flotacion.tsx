// ══ Nivel 14 · Hidrostática: contenido de la etapa 14.3, principio de Arquímedes y flotación (problemas propios) ───────
import type { RondaDef } from "@/motor/etapa";
import { Frac, Op, Sub, V } from "@/ui/Formula";
import { crearCubo, crearFlotacion, type ProblemaFlotacion } from "./modelo";

export { crearCubo, crearFlotacion, H_MAX, H_MIN, MATERIALES } from "./modelo";
export type { Material, ProblemaFlotacion } from "./modelo";

export const RONDAS_FLOTACION: RondaDef<ProblemaFlotacion>[] = [
  {
    ronda: "guiado",
    items: [
      crearFlotacion("g1", "agua", "madera", 600, 20, ["Flota cuando el empuje iguala al peso: se hunde la fracción de su altura que da la densidad del cuerpo entre la del líquido.", "h = 20 · 600 / 1000 = 12 cm."]),
      crearFlotacion("g2", "agua", "corcho", 250, 40, ["El corcho es muy liviano: se hunde solo un cuarto.", "h = 40 · 250 / 1000 = 10 cm."]),
      crearFlotacion("g3", "agua", "hielo", 900, 20, ["El hielo es apenas menos denso que el agua: se hunde casi entero.", "h = 20 · 900 / 1000 = 18 cm."]),
    ],
  },
  {
    ronda: "pista",
    items: [
      crearFlotacion("p1", "aceite", "madera", 500, 32, ["En un líquido menos denso, el bloque se hunde más.", "h = 32 · 500 / 800 = 20 cm."]),
      crearFlotacion("p2", "mercurio", "laton", 8500, 16, ["¡El latón flota en mercurio! 8500 < 13 600.", "h = 16 · 8500 / 13 600 = 10 cm."]),
      crearFlotacion("p3", "glicerina", "plastico", 750, 25, ["La glicerina es más densa que el agua: 1250 kg/m³.", "h = 25 · 750 / 1250 = 15 cm."]),
    ],
  },
  {
    ronda: "solo",
    items: [
      crearCubo("s1", "agua", 20, 4.8, ["Primero la densidad del cubo: ρ = m / V, con V = (0,2 m)³ = 0,008 m³.", "ρ = 4,8 / 0,008 = 600 kg/m³ → h = 20 · 600 / 1000 = 12 cm."]),
      crearCubo("s2", "agua", 10, 0.7, ["V = (0,1 m)³ = 0,001 m³.", "ρ = 0,7 / 0,001 = 700 kg/m³ → h = 7 cm."]),
      crearCubo("s3", "aceite", 20, 4.8, ["Es el mismo cubo del primero, pero en aceite.", "ρ = 600 kg/m³ → h = 20 · 600 / 800 = 15 cm."]),
      crearCubo("s4", "agua", 30, 22.5, ["V = (0,3 m)³ = 0,027 m³.", "ρ = 22,5 / 0,027 ≈ 833 kg/m³ → h = 30 · 22,5 / 27 = 25 cm."]),
    ],
  },
];

// ══ Fórmulas ───────
export const F_FLOTACION = (
  <>
    <V>h</V>
    <Op>=</Op>
    <V>H</V>
    <Op>·</Op>
    <Frac
      n={
        <>
          <V>ρ</V>
          <Sub>c</Sub>
        </>
      }
      d={
        <>
          <V>ρ</V>
          <Sub>l</Sub>
        </>
      }
    />
  </>
);
