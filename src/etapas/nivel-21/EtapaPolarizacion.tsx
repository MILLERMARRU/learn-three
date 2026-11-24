// ══ Etapa 21.2 · Polarización: el haz se atenúa y el luxómetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_MALUS, I_ESCALA, RONDAS_POLARIZACION, type ProblemaPolarizacion } from "@/contenido/nivel-21/polarizacion";
import { COS2 } from "@/lib/ondasEM";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPolarizacion } from "@/three/ondasEM/EscenaPolarizacion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS_EM, ESCENARIO_POLARIZACION, simularTecla, teclasOndasEM, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "21.2",
  titulo: "Polarización",
  nivel: "Ondas electromagnéticas",
  nivelNum: 21,
  siguiente: { ruta: "/nivel/21/radar", titulo: "Etapa 21.3 · Radar" },
  intro: (
    <>
      En la luz <b>polarizada</b>, el campo eléctrico oscila en una sola dirección. Un polarizador solo deja pasar la componente paralela a su eje: si está girado un ángulo θ, la intensidad cae a <b>I = I₀·cos²θ</b> (<b>ley de Malus</b>). La luz común no está polarizada: un primer polarizador deja pasar la mitad. Propón la intensidad: el luxómetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 W/m²" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡enciende! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Luz polarizada: I = I₀·cos²θ. La tecla que brilla te guía.",
    pista: "Ángulos notables: cos 37° = 0,8 y cos 53° = 0,6.",
    solo: "Luz sin polarizar: primero la mitad, luego Malus.",
  },
};

const textoCorto = (p: ProblemaPolarizacion) => `${p.I0} W/m² · ${p.theta}°`;
const fmt = (n: number) => String(n).replace(".", ",");

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaPolarizacion): string {
  const base = p.noPolarizada ? `${p.I0}/2 = ${p.I0 / 2} → ` : "";
  return `${base}I = ${p.noPolarizada ? p.I0 / 2 : p.I0} · ${fmt(COS2[p.theta])} = ${p.respuesta} W/m²`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPolarizacion() {
  const motor = useEtapa<ProblemaPolarizacion>({ clave: "n21-polarizacion", rondas: RONDAS_POLARIZACION, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(0, Math.min(I_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const encender = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El luxómetro llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la intensidad es ${v > p.respuesta ? "menor" : "mayor"} que ${v} W/m².` });
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
    } else if (e.key === "Enter") encender();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textoI0 = (q: ProblemaPolarizacion) => `I₀ = ${q.I0} W/m² · ${q.noPolarizada ? "sin polarizar" : "polarizada"}`;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ONDAS_EM}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPolarizacion I0={p.I0} theta={p.theta} noPolarizada={p.noPolarizada} I={p.respuesta} propuesta={v} escala={I_ESCALA} textoI0={textoI0(p)} textoTheta={`θ = ${p.theta}°`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPolarizacion I0={it.I0} theta={it.theta} noPolarizada={it.noPolarizada} I={it.respuesta} propuesta={null} escala={I_ESCALA} textoI0="" textoTheta="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = p.noPolarizada ? (
    <>
      Luz <b>sin polarizar</b> de <b>{p.I0} W/m²</b> atraviesa un polarizador y luego un analizador girado <b>{p.theta}°</b> respecto de él. ¿Qué intensidad sale?
    </>
  ) : (
    <>
      Luz <b>polarizada</b> de <b>{p.I0} W/m²</b> llega a un analizador girado <b>{p.theta}°</b> respecto de su polarización. ¿Qué intensidad sale?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <b>I₀ = {p.I0} W/m²</b>
        </span>
        <span className="var-chip">
          <b>θ = {p.theta}°</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_MALUS}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={encender} disabled={!motor.jugando || corriendo}>
            ¡Enciende!
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
          simbolo="I"
          valor={String(v)}
          unidad="W/m²"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la intensidad">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la intensidad">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasOndasEM(1, 10, "¡enciende!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_POLARIZACION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para encender la luz</span>}
    />
  );
}
