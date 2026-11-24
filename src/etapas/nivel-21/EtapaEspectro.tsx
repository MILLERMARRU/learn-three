// ══ Etapa 21.1 · Espectro electromagnético: la onda viaja, se marca su región y el medidor debe llegar a la marca ───────
import { useState } from "react";
import { F_ESPECTRO, fmtO, MAGNITUDES, RONDAS_ESPECTRO, type ProblemaEspectro } from "@/contenido/nivel-21/espectro";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaEspectro } from "@/three/ondasEM/EscenaEspectro";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS_EM, ESCENARIO_ESPECTRO, simularTecla, teclasOndasEM, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "21.1",
  titulo: "Espectro electromagnético",
  nivel: "Ondas electromagnéticas",
  nivelNum: 21,
  siguiente: { ruta: "/nivel/21/polarizacion", titulo: "Etapa 21.2 · Polarización" },
  intro: (
    <>
      Una <b>onda electromagnética</b> son un campo eléctrico E y uno magnético B que oscilan perpendiculares entre sí y a la dirección en que viajan. No necesitan un medio: en el vacío todas van a <b>c = 3 × 10⁸ m/s</b>, y cumplen <b>c = λ·f</b>. Según su λ forman el <b>espectro</b>: radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X y gamma. Propón el valor: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta en pasos chicos" },
    { teclas: ["←", "→"], texto: "en pasos grandes" },
    { teclas: ["⏎"], texto: "¡emite! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Radio: λ = c/f en metros. La tecla que brilla te guía.",
    pista: "Luz visible: λ en nanómetros (de 10 en 10).",
    solo: "La frecuencia: f = c/λ en MHz (de 10 en 10).",
  },
};

const nombreRegion: Record<string, string> = { radio: "radio", microondas: "microondas", infrarrojo: "infrarrojo", visible: "luz visible", ultravioleta: "ultravioleta", "rayos X": "rayos X", "rayos gamma": "rayos gamma" };

/** El dato del enunciado: la frecuencia (para hallar λ) o la longitud de onda (para hallar f). */
function textoDato(p: ProblemaEspectro): string {
  if (p.pide === "fMHz") return `λ = ${fmtO(p.lambda)} m`;
  if (p.pide === "lambdaM") return `f = ${p.f / 1e6} MHz`;
  return `f = ${fmtO(p.f / 1e14)} × 10¹⁴ Hz`;
}
const textoCorto = (p: ProblemaEspectro) => textoDato(p);

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaEspectro): string {
  const m = MAGNITUDES[p.pide];
  if (p.pide === "fMHz") return `f = 3×10⁸ / ${fmtO(p.lambda)} = ${p.respuesta} MHz (${nombreRegion[p.region]})`;
  if (p.pide === "lambdaM") return `λ = 3×10⁸ / ${p.f / 1e6}×10⁶ = ${p.respuesta} m (${nombreRegion[p.region]})`;
  return `λ = 3×10⁸ / ${fmtO(p.f / 1e14)}×10¹⁴ = ${p.respuesta} ${m.unidad} (${nombreRegion[p.region]})`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaEspectro() {
  const motor = useEtapa<ProblemaEspectro>({ clave: "n21-espectro", rondas: RONDAS_ESPECTRO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const m = MAGNITUDES[p.pide];
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

  const emitir = () => {
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
    } else if (e.key === "Enter") emitir();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= m.salto ? "→" : falta <= -m.salto ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ONDAS_EM}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaEspectro region={p.region} valor={p.respuesta} propuesta={v} escala={m.escala} textoDato={textoDato(p)} textoValor={`${m.simbolo} = ${p.respuesta} ${m.unidad} · ${nombreRegion[p.region]}`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaEspectro region={it.region} valor={it.respuesta} propuesta={null} escala={MAGNITUDES[it.pide].escala} textoDato="" textoValor="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.pide === "fMHz" ? (
      <>
        Una onda electromagnética tiene <b>λ = {fmtO(p.lambda)} m</b>. ¿Cuál es su frecuencia (en MHz)?
      </>
    ) : p.pide === "lambdaM" ? (
      <>
        Una emisora transmite a <b>{p.f / 1e6} MHz</b>. ¿Cuál es la longitud de onda de su señal (en m)?
      </>
    ) : (
      <>
        Una luz tiene una frecuencia de <b>{fmtO(p.f / 1e14)} × 10¹⁴ Hz</b>. ¿Cuál es su longitud de onda (en nm)?
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
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_ESPECTRO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={emitir} disabled={!motor.jugando || corriendo}>
            ¡Emite!
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
      teclado={<TecladoVirtual activas={teclasOndasEM(m.paso, m.salto, "¡emite!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ESPECTRO, vista: clave }}
      pieEscena={<span>↑ ↓ de {m.paso} · ← → de {m.salto} · Enter para emitir la onda</span>}
    />
  );
}
