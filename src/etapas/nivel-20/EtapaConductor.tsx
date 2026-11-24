// ══ Etapa 20.1 · Fuerza sobre un conductor: el cable se desvía y el dinamómetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_CONDUCTOR, F_ESCALA, F_MIN, fmtM, RONDAS_CONDUCTOR, type ProblemaConductor } from "@/contenido/nivel-20/conductor";
import { SENO } from "@/lib/magnetismo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaConductor } from "@/three/magnetismo/EscenaConductor";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_MAGNETISMO, ESCENARIO_CONDUCTOR, simularTecla, teclasMagnetismo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "20.1",
  titulo: "Fuerza sobre un conductor",
  nivel: "Electromagnetismo",
  nivelNum: 20,
  intro: (
    <>
      Un cable con corriente dentro de un campo magnético recibe una <b>fuerza</b>: es el principio de los motores eléctricos. Si el cable es perpendicular al campo, <b>F = B·I·L</b>; si forma un ángulo θ, <b>F = B·I·L·sen θ</b> (paralelo al campo, no hay fuerza). Su dirección la da la regla de la mano derecha. Propón la fuerza: el dinamómetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 mN" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡conecta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Perpendicular al campo: F = B·I·L. La tecla que brilla te guía.",
    pista: "Pasa los mT a T y los cm a m.",
    solo: "Cable inclinado: F = B·I·L·sen θ.",
  },
};

const textoB = (p: ProblemaConductor) => `B = ${p.enMili ? `${Math.round(p.B * 1000)} mT` : `${fmtM(p.B)} T`}`;
const textoL = (p: ProblemaConductor) => `L = ${p.enMili ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}${p.theta !== 90 ? ` · θ = ${p.theta}°` : ""}`;
const textoCorto = (p: ProblemaConductor) => `${textoB(p)} · ${fmtM(p.I)} A`;

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaConductor): string {
  const sen = p.theta === 90 ? "" : ` · ${fmtM(SENO[p.theta])}`;
  return `F = ${fmtM(p.B)} · ${fmtM(p.I)} · ${fmtM(p.L)}${sen} = ${fmtM(p.respuesta / 1000)} N = ${p.respuesta} mN`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaConductor() {
  const motor = useEtapa<ProblemaConductor>({ clave: "n20-conductor", rondas: RONDAS_CONDUCTOR, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const conectar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El dinamómetro llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la fuerza es ${v > p.respuesta ? "menor" : "mayor"} que ${v} mN.` });
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
    } else if (e.key === "Enter") conectar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MAGNETISMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaConductor F={p.respuesta} propuesta={v} escala={F_ESCALA} textoB={textoB(p)} textoI={`I = ${fmtM(p.I)} A`} textoL={textoL(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaConductor F={it.respuesta} propuesta={null} escala={F_ESCALA} textoB="" textoI="" textoL="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      Un cable de <b>{p.enMili ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}</b> con <b>{fmtM(p.I)} A</b> está dentro de un campo de <b>{p.enMili ? `${Math.round(p.B * 1000)} mT` : `${fmtM(p.B)} T`}</b>
      {p.theta === 90 ? ", perpendicular a él" : <>, formando <b>{p.theta}°</b> con él</>}. ¿Qué fuerza recibe (en mN)?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <b>{textoB(p)}</b>
        </span>
        <span className="var-chip">
          <V>I</V> <b>{fmtM(p.I)} A</b>
        </span>
        <span className="var-chip">
          <b>{textoL(p)}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CONDUCTOR}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={conectar} disabled={!motor.jugando || corriendo}>
            ¡Conecta!
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
          simbolo="F"
          valor={String(v)}
          unidad="mN"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la fuerza">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la fuerza">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasMagnetismo("¡conecta!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CONDUCTOR, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 mN · ← → de 10 · Enter para conectar la corriente</span>}
    />
  );
}
