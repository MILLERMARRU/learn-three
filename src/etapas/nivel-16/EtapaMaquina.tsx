// ══ Etapa 16.3 · Máquinas térmicas: el medidor de eficiencia debe llegar a la marca propuesta ───────
import { useState } from "react";
import { E_MAX, E_MIN, F_MAQUINA, RONDAS_MAQUINA, type ProblemaMaquina } from "@/contenido/nivel-16/maquina";
import { fmtT } from "@/contenido/nivel-16/modelo";
import { kelvin } from "@/lib/termo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaMaquina } from "@/three/termo/EscenaMaquina";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TERMO, ESCENARIO_MAQUINA, simularTecla, teclasTermo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "16.3",
  titulo: "Máquinas térmicas",
  nivel: "Termodinámica",
  nivelNum: 16,
  intro: (
    <>
      Una <b>máquina térmica</b> toma calor Q₁ de un foco caliente, convierte una parte en trabajo W y cede el resto, Q₂, a un foco frío: Q₁ = W + Q₂. Su <b>eficiencia</b> es <b>η = W/Q₁ = 1 − Q₂/Q₁</b>. Ninguna supera a la de Carnot, <b>1 − T₂/T₁</b> (en kelvin). Propón η: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 %" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡arranca! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Con el trabajo: η = W/Q₁. La tecla que brilla te guía.",
    pista: "Con los dos calores: η = 1 − Q₂/Q₁.",
    solo: "Máquina de Carnot: η = 1 − T₂/T₁, en kelvin.",
  },
};

/** Rótulos de la escena según lo que da el enunciado (los valores desconocidos no se rotulan). */
function textos(p: ProblemaMaquina) {
  if (p.dato === "carnot") return { textoCaliente: `T₁ = ${fmtT(p.a)} °C`, textoFrio: `T₂ = ${fmtT(p.b)} °C`, textoQ1: "Q₁", textoW: "W", textoQ2: "Q₂" };
  if (p.dato === "trabajo") return { textoCaliente: "foco caliente", textoFrio: "foco frío", textoQ1: `Q₁ = ${p.a} J`, textoW: `W = ${p.b} J`, textoQ2: "Q₂" };
  return { textoCaliente: "foco caliente", textoFrio: "foco frío", textoQ1: `Q₁ = ${p.a} J`, textoW: "W", textoQ2: `Q₂ = ${p.b} J` };
}
const textoCorto = (p: ProblemaMaquina) => ({ trabajo: "con W y Q₁", calores: "con Q₁ y Q₂", carnot: "Carnot" })[p.dato];

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaMaquina): string {
  if (p.dato === "trabajo") return `η = ${p.b}/${p.a} = ${p.respuesta} %`;
  if (p.dato === "calores") return `η = 1 − ${p.b}/${p.a} = ${p.respuesta} %`;
  return `η = 1 − ${kelvin(p.b)}/${kelvin(p.a)} = ${p.respuesta} %`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaMaquina() {
  const motor = useEtapa<ProblemaMaquina>({ clave: "n16-maquina", rondas: RONDAS_MAQUINA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(E_MIN, Math.min(E_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const arrancar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El medidor llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `El medidor se quedó antes de tu marca: la eficiencia es menor que ${v} %.` : `El medidor pasó tu marca: la eficiencia es mayor que ${v} %.` });
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
    } else if (e.key === "Enter") arrancar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_TERMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaMaquina eta={p.respuesta} etaPropuesta={v} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaMaquina eta={it.respuesta} etaPropuesta={null} textoCaliente="" textoFrio="" textoQ1="" textoW="" textoQ2="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.dato === "trabajo" ? (
      <>
        Una máquina toma <b>{p.a} J</b> de calor del foco caliente y hace <b>{p.b} J</b> de trabajo. ¿Cuál es su eficiencia?
      </>
    ) : p.dato === "calores" ? (
      <>
        Una máquina toma <b>{p.a} J</b> del foco caliente y cede <b>{p.b} J</b> al foco frío. ¿Cuál es su eficiencia?
      </>
    ) : (
      <>
        Una máquina de Carnot trabaja entre <b>{fmtT(p.a)} °C</b> y <b>{fmtT(p.b)} °C</b>. ¿Cuál es su eficiencia?
      </>
    );

  const chips =
    p.dato === "carnot"
      ? [
          ["T₁", `${fmtT(p.a)} °C`],
          ["T₂", `${fmtT(p.b)} °C`],
        ]
      : [
          ["Q₁", `${p.a} J`],
          p.dato === "trabajo" ? ["W", `${p.b} J`] : ["Q₂", `${p.b} J`],
        ];

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {chips.map(([s, val]) => (
          <span key={s} className="var-chip">
            <V>{s}</V> <b>{val}</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_MAQUINA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-10)} disabled={!motor.jugando}>
            −10
          </button>
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            −1
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            +1
          </button>
          <button className="btn" onClick={() => cambiar(10)} disabled={!motor.jugando}>
            +10
          </button>
          <button className="btn btn-pri" onClick={arrancar} disabled={!motor.jugando || corriendo}>
            ¡Arranca!
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
          simbolo="η"
          valor={String(v)}
          unidad="%"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la eficiencia">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la eficiencia">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasTermo("¡arranca!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_MAQUINA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 % · ← → de 10 · Enter para arrancar la máquina</span>}
    />
  );
}
