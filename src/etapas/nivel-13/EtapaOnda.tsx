// ══ Etapa 13.1 · Longitud de onda, frecuencia y velocidad: una onda fantasma con el valor propuesto viaja sobre la real ───────
import { useState } from "react";
import { F_ONDA, fmtO, O_MAX, O_MIN, RONDAS_ONDA, type ProblemaOnda } from "@/contenido/nivel-13/onda";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaOnda } from "@/three/ondas/EscenaOnda";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS, ESCENARIO_ONDA, simularTecla, TECLAS_ONDA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "13.1",
  titulo: "Longitud de onda, frecuencia y velocidad",
  nivel: "Ondas mecánicas",
  nivelNum: 13,
  intro: (
    <>
      Una onda lleva energía sin llevar materia: cada punto de la cuerda solo sube y baja. La distancia entre dos crestas es la <b>longitud de onda λ</b>; las crestas que pasan por segundo, la <b>frecuencia f</b>. En un período la onda avanza λ, así que <b>v = λ·f = λ/T</b>. Propón el valor que falta: una <b>onda fantasma</b> viajará con él sobre la real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/13/pulso", titulo: "Etapa 13.2 · Velocidad de una onda en una cuerda" },
  descRondas: {
    guiado: "Longitud de onda: λ = v / f. La tecla que brilla te guía.",
    pista: "Velocidad: v = λ·f (o λ/T).",
    solo: "Frecuencia: f = v / λ, con decimales.",
  },
};

const unidad = (p: ProblemaOnda) => (p.tipo === "lambda" ? "m" : p.tipo === "v" ? "m/s" : "Hz");
const simbolo = (p: ProblemaOnda) => (p.tipo === "lambda" ? "λ" : p.tipo === "v" ? "v" : "f");

/** La cuenta: «λ = 12 / 3 = 4 m». */
function cuenta(p: ProblemaOnda): string {
  if (p.tipo === "lambda") return `λ = ${fmtO(p.v)} / ${fmtO(p.f)} = ${p.respuesta} m`;
  if (p.tipo === "v") return `v = ${fmtO(p.lambda)} · ${fmtO(p.f)} = ${p.respuesta} m/s`;
  return `f = ${fmtO(p.v)} / ${fmtO(p.lambda)} = ${p.respuesta} Hz`;
}

const textoCorto = (p: ProblemaOnda) => (p.tipo === "lambda" ? `v = ${p.v} · f = ${p.f}` : p.tipo === "v" ? `λ = ${fmtO(p.lambda)} m` : `v = ${p.v} m/s`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaOnda() {
  const motor = useEtapa<ProblemaOnda>({ clave: "n13-onda", rondas: RONDAS_ONDA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 1 });
  const v = st.clave === clave ? st.v : 1;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const u = unidad(p);

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(O_MIN, Math.min(O_MAX, v + d)) });
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
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Las crestas coinciden! ${cuenta(p)}.` });
    } else {
      motor.error();
      const como = p.tipo === "lambda" ? (v > p.respuesta ? "tiene crestas más separadas" : "tiene crestas más juntas") : v > p.respuesta ? "se adelantó" : "se quedó atrás";
      setFb({ clave, tipo: "mal", texto: `La onda fantasma ${como}: el valor real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} ${u}.` });
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
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ONDAS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaOnda tipo={p.tipo} lambda={p.lambda} f={p.f} v={p.v} conT={p.conT} propuesta={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaOnda tipo={it.tipo} lambda={it.lambda} f={it.f} v={it.v} conT={it.conT} propuesta={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const fuente = p.conT ? <>período <b>{fmtO(1 / p.f)} s</b></> : <>frecuencia <b>{fmtO(p.f)} Hz</b></>;
  const enunciado =
    p.tipo === "lambda" ? (
      <>
        Una onda viaja por una cuerda a <b>{fmtO(p.v)} m/s</b> con {fuente}. ¿Cuál es su longitud de onda?
      </>
    ) : p.tipo === "v" ? (
      <>
        Una onda tiene longitud de onda <b>{fmtO(p.lambda)} m</b> y {fuente}. ¿Con qué velocidad viaja?
      </>
    ) : (
      <>
        Una onda viaja a <b>{fmtO(p.v)} m/s</b> con longitud de onda <b>{fmtO(p.lambda)} m</b>. ¿Cuál es su frecuencia?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.tipo !== "lambda" && (
          <span className="var-chip">
            <V>λ</V> <b>{fmtO(p.lambda)} m</b>
          </span>
        )}
        {p.tipo !== "f" && (
          <span className="var-chip">
            {p.conT ? <V>T</V> : <V>f</V>} <b>{p.conT ? `${fmtO(1 / p.f)} s` : `${fmtO(p.f)} Hz`}</b>
          </span>
        )}
        {p.tipo !== "v" && (
          <span className="var-chip">
            <V>v</V> <b>{fmtO(p.v)} m/s</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_ONDA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo={simbolo(p)}
          valor={String(v)}
          unidad={u}
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
      teclado={<TecladoVirtual activas={TECLAS_ONDA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ONDA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para soltar</span>}
    />
  );
}
