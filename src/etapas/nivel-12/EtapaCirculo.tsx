// ══ Etapa 12.3 · MAS y movimiento circular: v máx, a máx o rapidez en x; un punto fantasma gira con el valor propuesto ───────
import { useState } from "react";
import { C_MAX, C_MIN, F_CIRCULO, omegaPropuesta, RONDAS_CIRCULO, type ProblemaCirculo } from "@/contenido/nivel-12/circulo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCirculo } from "@/three/oscilaciones/EscenaCirculo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_OSCILACIONES, ESCENARIO_CIRCULO, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "12.3",
  titulo: "MAS y movimiento circular",
  nivel: "Oscilaciones (MAS)",
  nivelNum: 12,
  intro: (
    <>
      Si un punto gira en un círculo de radio A con velocidad angular ω, su <b>sombra</b> sobre un diámetro va y viene: hace un MAS de amplitud A y la misma ω. Por eso <b>v máx = A·ω</b> (en el centro), <b>a máx = A·ω²</b> (en los extremos) y, a una distancia x del centro, v = ω√(A² − x²). Propón el valor: un <b>punto fantasma</b> girará con él.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡gira! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Velocidad máxima: v = A·ω. La tecla que brilla te guía.",
    pista: "Aceleración máxima: a = A·ω².",
    solo: "Rapidez a una distancia x del centro.",
  },
};

const TECLAS_C: Record<string, DecoTecla> = {
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: "¡gira!" },
  h: { sub: "pista" },
};

const unidadDe = (p: ProblemaCirculo) => (p.tipo === "a" ? "m/s²" : "m/s");
const nombreDe = (p: ProblemaCirculo) => (p.tipo === "v" ? "v máx" : p.tipo === "a" ? "a máx" : "v");

/** La cuenta: «v = 0,5·4 = 2 m/s», «a = 0,5·4² = 8 m/s²» o «v = 2·√(5² − 3²) = 8 m/s». */
function cuenta(p: ProblemaCirculo): string {
  const A = fmtNum(p.A, 2);
  if (p.tipo === "v") return `v máx = ${A}·${p.w} = ${p.respuesta} m/s`;
  if (p.tipo === "a") return `a máx = ${A}·${p.w}² = ${p.respuesta} m/s²`;
  return `v = ${p.w}·√(${A}² − ${fmtNum(p.x, 2)}²) = ${p.respuesta} m/s`;
}

const textoCorto = (p: ProblemaCirculo) => `A = ${fmtNum(p.A, 2)} m · ω = ${p.w}`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCirculo() {
  const motor = useEtapa<ProblemaCirculo>({ clave: "n12-circulo", rondas: RONDAS_CIRCULO, avanceMs: 1900 });
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
  const unidad = unidadDe(p);

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(C_MIN, Math.min(C_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const girar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡Giran juntos! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El punto fantasma ${v > p.respuesta ? "se adelantó" : "se quedó atrás"}: el valor real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} ${unidad}.` });
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
    } else if (e.key === "Enter") girar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_OSCILACIONES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCirculo
            A={p.A}
            w={p.w}
            wFantasma={omegaPropuesta(p, v)}
            x={p.x}
            rotulo={exito ? `${nombreDe(p)} = ${p.respuesta} ${unidad}` : null}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaCirculo A={it.A} w={it.w} wFantasma={null} x={it.x} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const pregunta =
    p.tipo === "v" ? "¿Cuál es su velocidad máxima?" : p.tipo === "a" ? "¿Cuál es su aceleración máxima?" : p.x === 0 ? "¿Con qué rapidez pasa por el centro?" : <>¿Con qué rapidez pasa a <b>{fmtNum(p.x, 2)} m</b> del centro?</>;
  const enunciado = (
    <>
      Un cuerpo hace un MAS de amplitud <b>{fmtNum(p.A, 2)} m</b> con frecuencia angular <b>ω = {p.w} rad/s</b>. {pregunta}
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>A</V> <b>{fmtNum(p.A, 2)} m</b>
        </span>
        <span className="var-chip">
          <V>ω</V> <b>{p.w} rad/s</b>
        </span>
        {p.tipo === "vx" && (
          <span className="var-chip">
            <V>x</V> <b>{fmtNum(p.x, 2)} m</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CIRCULO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={girar} disabled={!motor.jugando || corriendo}>
            ¡Gira!
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
          simbolo={p.tipo === "a" ? "a" : "v"}
          valor={String(v)}
          unidad={unidad}
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
      teclado={<TecladoVirtual activas={TECLAS_C} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CIRCULO, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para girar</span>}
    />
  );
}
