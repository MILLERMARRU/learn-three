// ══ Etapa 18.1 · Ley de Ohm: la aguja del multímetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_OHM, fmtE, MEDIDORES, O_MAX, O_MIN, RONDAS_OHM, type ProblemaOhm } from "@/contenido/nivel-18/ohm";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaOhm } from "@/three/circuitos/EscenaOhm";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CIRCUITOS, ESCENARIO_OHM, simularTecla, teclasCircuito, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "18.1",
  titulo: "Ley de Ohm",
  nivel: "Electrodinámica",
  nivelNum: 18,
  intro: (
    <>
      Una pila empuja a los electrones por el circuito: eso es la <b>corriente</b> I (en amperes). La resistencia R (en ohm) se opone a su paso, y el voltaje V (en voltios) es el empuje. Los tres se relacionan con la <b>ley de Ohm, V = I·R</b>. Propón el valor que se pide: la aguja del multímetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡cierra el circuito! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "La corriente: I = V/R. La tecla que brilla te guía.",
    pista: "El voltaje: V = I·R.",
    solo: "La resistencia: R = V/I.",
  },
};

const textoCorto = (p: ProblemaOhm) => `calcula ${p.pide}`;
const val = (p: ProblemaOhm, m: "I" | "V" | "R") => (p.pide === m ? "?" : `${fmtE(p[m])} ${MEDIDORES[m].unidad}`);

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaOhm): string {
  if (p.pide === "I") return `I = ${fmtE(p.V)} / ${fmtE(p.R)} = ${p.respuesta} A`;
  if (p.pide === "V") return `V = ${fmtE(p.I)} · ${fmtE(p.R)} = ${p.respuesta} V`;
  return `R = ${fmtE(p.V)} / ${fmtE(p.I)} = ${p.respuesta} Ω`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaOhm() {
  const motor = useEtapa<ProblemaOhm>({ clave: "n18-ohm", rondas: RONDAS_OHM, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const med = MEDIDORES[p.pide];
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
    setSt({ clave, v: Math.max(O_MIN, Math.min(O_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const cerrar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡La aguja llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: ${p.pide} es ${v > p.respuesta ? "menor" : "mayor"} que ${v} ${med.unidad}.` });
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
    } else if (e.key === "Enter") cerrar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textos = (q: ProblemaOhm) => ({ textoPila: `V = ${val(q, "V")}`, textoR: `R = ${val(q, "R")}`, textoI: `I = ${val(q, "I")}`, textoMedidor: MEDIDORES[q.pide].medidor });

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CIRCUITOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaOhm pide={p.pide} escala={med.escala} valor={p.respuesta} propuesta={v} I={p.I} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaOhm pide={it.pide} escala={MEDIDORES[it.pide].escala} valor={it.respuesta} propuesta={null} I={it.I} textoPila="" textoR="" textoI="" textoMedidor="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.pide === "I" ? (
      <>
        Una pila de <b>{fmtE(p.V)} V</b> se conecta a una resistencia de <b>{fmtE(p.R)} Ω</b>. ¿Qué corriente circula?
      </>
    ) : p.pide === "V" ? (
      <>
        Por una resistencia de <b>{fmtE(p.R)} Ω</b> circulan <b>{fmtE(p.I)} A</b>. ¿Qué voltaje tiene entre sus extremos?
      </>
    ) : (
      <>
        Una pila de <b>{fmtE(p.V)} V</b> hace circular <b>{fmtE(p.I)} A</b> por una resistencia. ¿Cuánto vale la resistencia?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {(["V", "I", "R"] as const)
          .filter((m) => m !== p.pide)
          .map((m) => (
            <span key={m} className="var-chip">
              <V>{m}</V> <b>{val(p, m)}</b>
            </span>
          ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_OHM}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={cerrar} disabled={!motor.jugando || corriendo}>
            ¡Cierra!
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
          simbolo={p.pide}
          valor={String(v)}
          unidad={med.unidad}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCircuito("¡cierra!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_OHM, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para cerrar el circuito</span>}
    />
  );
}
