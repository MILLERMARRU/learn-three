// ══ Etapa 21.3 · Radar: el pulso va y vuelve, y el medidor debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_RADAR, fmtO, MAGNITUDES_RADAR, RONDAS_RADAR, type ProblemaRadar } from "@/contenido/nivel-21/radar";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRadar } from "@/three/ondasEM/EscenaRadar";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS_EM, ESCENARIO_RADAR, simularTecla, teclasOndasEM, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "21.3",
  titulo: "Radar",
  nivel: "Ondas electromagnéticas",
  nivelNum: 21,
  intro: (
    <>
      Un <b>radar</b> emite un pulso de ondas de radio que viaja a <b>c = 3 × 10⁸ m/s</b>, rebota en el objeto y vuelve como <b>eco</b>. El tiempo t que mide es de ida y vuelta: el pulso recorre 2d, así que <b>d = c·t / 2</b>. Propón el valor: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta en pasos chicos" },
    { teclas: ["←", "→"], texto: "en pasos grandes" },
    { teclas: ["⏎"], texto: "¡detecta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "El eco tarda t (en µs) en ir y volver: d = c·t/2 en km. La tecla que brilla te guía.",
    pista: "Ahora t viene en milisegundos (1 ms = 10⁻³ s).",
    solo: "Al revés: t = 2d/c en µs (de 10 en 10).",
  },
};

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** El dato del enunciado: el tiempo del eco (para hallar d) o la distancia (para hallar t). */
function textoDato(p: ProblemaRadar): string {
  if (p.pide === "tUs") return `d = ${r6(p.d / 1000)} km`;
  return p.unidadT === "ms" ? `t = ${fmtO(r6(p.t * 1e3))} ms` : `t = ${r6(p.t * 1e6)} µs`;
}

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaRadar): string {
  if (p.pide === "tUs") return `t = 2 · ${r6(p.d / 1000)}×10³ / 3×10⁸ = ${p.respuesta} µs`;
  const t = p.unidadT === "ms" ? `${fmtO(r6(p.t * 1e3))}×10⁻³` : `${r6(p.t * 1e6)}×10⁻⁶`;
  return `d = 3×10⁸ · ${t} / 2 = ${p.respuesta} km`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaRadar() {
  const motor = useEtapa<ProblemaRadar>({ clave: "n21-radar", rondas: RONDAS_RADAR, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const m = MAGNITUDES_RADAR[p.pide];
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
    setSt({ clave, v: Math.max(0, Math.min(m.escala, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const detectar = () => {
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
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: ${m.simbolo} es ${v > p.respuesta ? "menor" : "mayor"} que ${v} ${m.unidad}.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const pasos: Record<string, number> = { ArrowUp: m.paso, ArrowDown: -m.paso, ArrowRight: m.salto, ArrowLeft: -m.salto };
    if (pasos[e.key] !== undefined) {
      e.preventDefault();
      cambiar(pasos[e.key]);
    } else if (e.key === "Enter") detectar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= m.salto ? "→" : falta <= -m.salto ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textoMedidor = (q: ProblemaRadar) => (q.pide === "dKm" ? "distancia" : "tiempo del eco");

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ONDAS_EM}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRadar valor={p.respuesta} propuesta={v} escala={m.escala} textoDato={textoDato(p)} textoValor={`${m.simbolo} = ${p.respuesta} ${m.unidad}`} textoMedidor={textoMedidor(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaRadar valor={it.respuesta} propuesta={null} escala={MAGNITUDES_RADAR[it.pide].escala} textoDato="" textoValor="" textoMedidor="" previa={rol === "siguiente" ? textoDato(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.pide === "tUs" ? (
      <>
        Un avión está a <b>{r6(p.d / 1000)} km</b> del radar. ¿Cuánto tarda el eco en volver (en µs)?
      </>
    ) : (
      <>
        El eco de un pulso de radar vuelve <b>{textoDato(p).slice(4)}</b> después de emitido. ¿A qué distancia está el avión (en km)?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <b>{textoDato(p)}</b>
        </span>
        <span className="var-chip">
          <b>c = 3 × 10⁸ m/s</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_RADAR}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-m.salto)} disabled={!motor.jugando}>
            −{m.salto}
          </button>
          <button className="btn" onClick={() => cambiar(-m.paso)} disabled={!motor.jugando}>
            −{m.paso}
          </button>
          <button className="btn" onClick={() => cambiar(m.paso)} disabled={!motor.jugando}>
            +{m.paso}
          </button>
          <button className="btn" onClick={() => cambiar(m.salto)} disabled={!motor.jugando}>
            +{m.salto}
          </button>
          <button className="btn btn-pri" onClick={detectar} disabled={!motor.jugando || corriendo}>
            ¡Detecta!
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
          simbolo={m.simbolo}
          valor={String(v)}
          unidad={m.unidad}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(m.paso)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-m.paso)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasOndasEM(m.paso, m.salto, "¡detecta!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_RADAR, vista: clave }}
      pieEscena={<span>↑ ↓ de {m.paso} · ← → de {m.salto} · Enter para emitir el pulso</span>}
    />
  );
}
