// ══ Etapa 16.2 · Trabajo de un gas: el área del diagrama P–V debe llenarse hasta la marca propuesta ───────
import { useState } from "react";
import { fmtT } from "@/contenido/nivel-16/modelo";
import { F_TRABAJO, RONDAS_TRABAJO, W_MAX, W_MIN, type ProblemaTrabajo } from "@/contenido/nivel-16/trabajo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaTrabajo } from "@/three/termo/EscenaTrabajo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TERMO, ESCENARIO_TRABAJO, simularTecla, teclasTermo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "16.2",
  titulo: "Trabajo de un gas",
  nivel: "Termodinámica",
  nivelNum: 16,
  intro: (
    <>
      Cuando un gas se expande empuja el pistón y hace <b>trabajo</b>. A presión constante, <b>W = P·ΔV</b>: es el <b>área bajo la línea</b> del diagrama P–V. Si el gas se comprime, ΔV es negativo y su trabajo también (lo hacen sobre él). Con kPa y m³ el trabajo sale en kJ. Propón W: el área se llenará y debe terminar en tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 kJ" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mueve el pistón! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "kPa y m³: W = P·ΔV en kJ. La tecla que brilla te guía.",
    pista: "Volúmenes en litros: pásalos a m³.",
    solo: "atm y litros, y gases que se comprimen (W negativo).",
  },
};

const unV = (p: ProblemaTrabajo) => (p.unidades === "kPa-m3" ? "m³" : "L");
const unP = (p: ProblemaTrabajo) => (p.unidades === "atm-L" ? "atm" : "kPa");
const textoCorto = (p: ProblemaTrabajo) => (p.V2 > p.V1 ? "se expande" : "se comprime");

/** La cuenta: «W = 200 kPa · 0,02 m³ = 4 kJ». */
function cuenta(p: ProblemaTrabajo): string {
  const dV = Math.round((p.V2m - p.V1m) * 1e6) / 1e6;
  const tdV = dV < 0 ? `(${fmtT(dV)})` : fmtT(dV);
  return `W = ${p.Pk} kPa · ${tdV} m³ = ${fmtT(p.respuesta)} kJ`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaTrabajo() {
  const motor = useEtapa<ProblemaTrabajo>({ clave: "n16-trabajo", rondas: RONDAS_TRABAJO, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(W_MIN, Math.min(W_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const iniciar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El área terminó en tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      const signo = Math.sign(v) !== Math.sign(p.respuesta) && v !== 0 ? " Revisa el signo: ¿se expande o se comprime?" : "";
      setFb({ clave, tipo: "mal", texto: `El área no terminó en tu marca: W es ${v > p.respuesta ? "menor" : "mayor"} que ${fmtT(v)} kJ.${signo}` });
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
    } else if (e.key === "Enter") iniciar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const textos = (q: ProblemaTrabajo) => ({ textoP: `P = ${fmtT(q.P)} ${unP(q)}`, textoV1: `V₁ = ${fmtT(q.V1)} ${unV(q)}`, textoV2: `V₂ = ${fmtT(q.V2)} ${unV(q)}` });
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_TERMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaTrabajo Pk={p.Pk} V1={p.V1m} V2={p.V2m} Wpropuesto={v} W={p.respuesta} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaTrabajo Pk={it.Pk} V1={it.V1m} V2={it.V2m} Wpropuesto={null} W={it.respuesta} textoP="" textoV1="" textoV2="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const tP = `${fmtT(p.P)} ${unP(p)}`;
  const tV1 = `${fmtT(p.V1)} ${unV(p)}`;
  const tV2 = `${fmtT(p.V2)} ${unV(p)}`;
  const enunciado = (
    <>
      A presión constante de <b>{tP}</b>, un gas {p.V2 > p.V1 ? "se expande" : "se comprime"} de <b>{tV1}</b> a <b>{tV2}</b>. ¿Cuánto trabajo hace el gas (en kJ)?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>P</V> <b>{tP}</b>
        </span>
        <span className="var-chip">
          <V>V₁</V> <b>{tV1}</b>
        </span>
        <span className="var-chip">
          <V>V₂</V> <b>{tV2}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_TRABAJO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={iniciar} disabled={!motor.jugando || corriendo}>
            ¡Mueve!
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
          simbolo="W"
          valor={fmtT(v)}
          unidad="kJ"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el trabajo">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el trabajo">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasTermo("¡mueve!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_TRABAJO, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 kJ · ← → de 10 · Enter para mover el pistón</span>}
    />
  );
}
