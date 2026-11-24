// ══ Etapa 14.2 · Principio de Pascal: la fuerza justa en el émbolo chico sostiene el auto en equilibrio ───────
import { useState } from "react";
import { F_MAX, F_MIN, F_PASO, F_PRENSA, RONDAS_PRENSA, type ProblemaPrensa } from "@/contenido/nivel-14/prensa";
import { fmtF } from "@/contenido/nivel-14/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPrensa } from "@/three/fluidos/EscenaPrensa";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_FLUIDOS, ESCENARIO_PRENSA, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "14.2",
  titulo: "Principio de Pascal",
  nivel: "Hidrostática",
  nivelNum: 14,
  siguiente: { ruta: "/nivel/14/flotacion", titulo: "Etapa 14.3 · Principio de Arquímedes" },
  intro: (
    <>
      Un líquido encerrado transmite la presión <b>igual a todos sus puntos</b>: es el <b>principio de Pascal</b>. En una prensa hidráulica, la presión en el émbolo chico es la misma que en el grande, <b>F₁/A₁ = F₂/A₂</b>, así que una fuerza pequeña sostiene un auto. Propón la fuerza en el émbolo chico: si es la justa, el auto queda en equilibrio; si no, sube o baja.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 10 en 10 N" },
    { teclas: ["←", "→"], texto: "de 100 en 100" },
    { teclas: ["⏎"], texto: "¡empuja! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Áreas en m²: F₁ = F₂·A₁/A₂. La tecla que brilla te guía.",
    pista: "Áreas en cm²: solo importa el cociente.",
    solo: "Radios: el área va con el cuadrado del radio.",
  },
};

const TECLAS_PRENSA: Record<string, DecoTecla> = {
  "↑": { sub: "+10" },
  "↓": { sub: "−10" },
  "→": { sub: "+100" },
  "←": { sub: "−100" },
  intro: { sub: "¡empuja!" },
  h: { sub: "pista" },
};

/** Los émbolos como los da el enunciado: «A₁ = 0,01 m²», «A₁ = 10 cm²» o «r₁ = 2 cm». */
function embolo(p: ProblemaPrensa, i: 1 | 2): string {
  const val = fmtF(i === 1 ? p.a1 : p.a2);
  const sub = i === 1 ? "₁" : "₂";
  if (p.dato === "radio") return `r${sub} = ${val} cm`;
  return `A${sub} = ${val} ${p.dato === "m2" ? "m²" : "cm²"}`;
}

/** Miles con espacio: «10 000». */
const miles = (n: number) => (n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : String(n));

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaPrensa): string {
  const F2 = miles(p.masa * 10);
  if (p.dato === "radio") return `F₁ = ${F2}·(${fmtF(p.a1)}/${fmtF(p.a2)})² = ${p.respuesta} N`;
  return `F₁ = ${F2}·${fmtF(p.a1)}/${fmtF(p.a2)} = ${p.respuesta} N`;
}

const textoCorto = (p: ProblemaPrensa) => `${p.masa} kg · ${p.dato === "radio" ? "radios" : "áreas"}`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPrensa() {
  const motor = useEtapa<ProblemaPrensa>({ clave: "n14-prensa", rondas: RONDAS_PRENSA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 100 });
  const v = st.clave === clave ? st.v : 100;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const empujar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡El auto quedó en equilibrio! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `El auto subió: ${v} N es demasiada fuerza.` : `El auto bajó: ${v} N no alcanza para sostenerlo.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const pasos: Record<string, number> = { ArrowUp: F_PASO, ArrowDown: -F_PASO, ArrowRight: 100, ArrowLeft: -100 };
    if (pasos[e.key] !== undefined) {
      e.preventDefault();
      cambiar(pasos[e.key]);
    } else if (e.key === "Enter") empujar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 100 ? "→" : falta <= -100 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_FLUIDOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPrensa F={p.respuesta} Fpropuesta={v} textoA1={embolo(p, 1)} textoA2={embolo(p, 2)} textoAuto={`${p.masa} kg`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPrensa F={it.respuesta} Fpropuesta={null} textoA1="" textoA2="" textoAuto="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      Un auto de <b>{p.masa} kg</b> descansa sobre el émbolo grande de una prensa hidráulica ({p.dato === "radio" ? "radios" : "áreas"}: <b>{embolo(p, 1)}</b> y <b>{embolo(p, 2)}</b>). ¿Qué fuerza en el émbolo chico lo mantiene en equilibrio?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>F₂</V> <b>{miles(p.masa * 10)} N</b>
        </span>
        <span className="var-chip">
          <b>{embolo(p, 1)}</b>
        </span>
        <span className="var-chip">
          <b>{embolo(p, 2)}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_PRENSA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-100)} disabled={!motor.jugando}>
            −100
          </button>
          <button className="btn" onClick={() => cambiar(-F_PASO)} disabled={!motor.jugando}>
            −10
          </button>
          <button className="btn" onClick={() => cambiar(F_PASO)} disabled={!motor.jugando}>
            +10
          </button>
          <button className="btn" onClick={() => cambiar(100)} disabled={!motor.jugando}>
            +100
          </button>
          <button className="btn btn-pri" onClick={empujar} disabled={!motor.jugando || corriendo}>
            ¡Empuja!
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
          simbolo="F₁"
          valor={String(v)}
          unidad="N"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(F_PASO)} aria-label="Subir la fuerza">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-F_PASO)} aria-label="Bajar la fuerza">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_PRENSA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PRENSA, vista: clave }}
      pieEscena={<span>↑ ↓ de 10 N · ← → de 100 · Enter para empujar</span>}
    />
  );
}
