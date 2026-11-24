// ══ Etapa 12.2 · Péndulo simple: predice el período y una lenteja fantasma oscila junto a la real ───────
import { useState } from "react";
import { fmtT, T10_MAX, T10_MIN } from "@/contenido/nivel-12/resorte";
import { F_PENDULO, RONDAS_PENDULO, type ProblemaPendulo } from "@/contenido/nivel-12/pendulo";
import { periodoPendulo } from "@/lib/oscilaciones";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPendulo } from "@/three/oscilaciones/EscenaPendulo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_OSCILACIONES, ESCENARIO_PENDULO, fmtNum, simularTecla, TECLAS_T, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "12.2",
  titulo: "Péndulo simple",
  nivel: "Oscilaciones (MAS)",
  nivelNum: 12,
  intro: (
    <>
      Para ángulos pequeños, un péndulo también hace un MAS. Su período, <b>T = 2π√(L/g)</b>, no depende de la masa ni de la amplitud: solo del largo del hilo y de la gravedad. En la Tierra, <b>g ≈ π² ≈ 10</b>, así que T = 2√L. Propón el período: una <b>lenteja fantasma</b> oscilará con él junto a la real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta T de 0,1 en 0,1 s" },
    { teclas: ["←", "→"], texto: "de 1 en 1 s" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/12/circulo", titulo: "Etapa 12.3 · MAS y movimiento circular" },
  descRondas: {
    guiado: "En la Tierra: T = 2√L. La tecla que brilla te guía.",
    pista: "¿Qué pasa si alargas o acortas el hilo?",
    solo: "En otros planetas: T = 2√(10·L/g).",
  },
};

/** La cuenta: «T = 2√1 = 2 s» en la Tierra o «T = 2√(10·1/2,5) = 4 s» en otro planeta. */
function cuenta(p: ProblemaPendulo): string {
  return p.g === 10 ? `T = 2√${fmtNum(p.L, 2)} = ${fmtT(p.respuesta)} s` : `T = 2√(10·${fmtNum(p.L, 2)}/${fmtNum(p.g, 1)}) = ${fmtT(p.respuesta)} s`;
}

const textoCorto = (p: ProblemaPendulo) => `L = ${fmtNum(p.L, 2)} m${p.g !== 10 ? ` · g = ${fmtNum(p.g, 1)}` : ""}`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPendulo() {
  const motor = useEtapa<ProblemaPendulo>({ clave: "n12-pendulo", rondas: RONDAS_PENDULO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // en décimas de segundo; se parte de 1 s (o del período conocido)
  const inicial = p.base ? Math.round(periodoPendulo(p.base.L, p.g) * 10) : 10;
  const [st, setSt] = useState({ clave: "", v10: 10 });
  const v10 = st.clave === clave ? st.v10 : inicial;
  const v = v10 / 10;
  const r10 = Math.round(p.respuesta * 10);
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v10: Math.max(T10_MIN, Math.min(T10_MAX, v10 + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const soltar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (v10 === r10) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡En fase! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El fantasma oscila más ${v10 > r10 ? "lento" : "rápido"}: el período real es ${v10 > r10 ? "menor" : "mayor"} que ${fmtT(v)} s.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const pasos: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, ArrowRight: 10, ArrowLeft: -10 };
    if (pasos[e.key] !== undefined) {
      e.preventDefault();
      cambiar(pasos[e.key]);
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = r10 - v10;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_OSCILACIONES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPendulo L={p.L} g={p.g} T={p.respuesta} Tfantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPendulo L={it.L} g={it.g} T={it.respuesta} Tfantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = p.base ? (
    <>
      Un péndulo de {fmtNum(p.base.L, 2)} m oscila con período <b>{fmtT(periodoPendulo(p.base.L, p.g))} s</b>. Si el hilo mide ahora <b>{fmtNum(p.L, 2)} m</b>, ¿cuál es el nuevo período?
    </>
  ) : p.g === 10 ? (
    <>
      Un péndulo simple de <b>{fmtNum(p.L, 2)} m</b> oscila en la Tierra (g ≈ π² ≈ 10 m/s²). ¿Cuál es su período?
    </>
  ) : (
    <>
      Un péndulo de <b>{fmtNum(p.L, 2)} m</b> oscila en un lugar donde <b>g = {fmtNum(p.g, 1)} m/s²</b>. ¿Cuál es su período? (π² ≈ 10)
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>L</V> <b>{fmtNum(p.L, 2)} m</b>
        </span>
        <span className="var-chip">
          <V>g</V> <b>{fmtNum(p.g, 1)} m/s²</b>
        </span>
        <span className="var-chip">
          π² <b>≈ 10</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_PENDULO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-10)} disabled={!motor.jugando}>
            −1
          </button>
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            −0,1
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            +0,1
          </button>
          <button className="btn" onClick={() => cambiar(10)} disabled={!motor.jugando}>
            +1
          </button>
          <button className="btn btn-pri" onClick={soltar} disabled={!motor.jugando || corriendo}>
            ¡Suelta!
          </button>
        </div>
      </div>
    </>
  );

  return (
    <CascaronEtapa
      meta={META}
      motor={motor}
      escena={escena}
      panel={panel}
      retro={retro ? <RetroLinea tipo={retro.tipo}>{retro.texto}</RetroLinea> : null}
      respuesta={
        <ValorTexto
          simbolo="T"
          valor={fmtT(v)}
          unidad="s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el período">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el período">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_T} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PENDULO, vista: clave }}
      pieEscena={<span>↑ ↓ de 0,1 s · ← → de 1 s · Enter para soltar</span>}
    />
  );
}
