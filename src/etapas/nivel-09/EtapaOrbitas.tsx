// ══ Etapa 9.3 · Satélites y leyes de Kepler: propone el período o la velocidad y un satélite fantasma gira junto al real ───────
import { useState } from "react";
import { F_KEPLER, F_V_ORBITAL, fraccionQ, O_MAX, O_MIN, RONDAS_ORBITAS, type ProblemaOrbita } from "@/contenido/nivel-09/orbitas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaOrbitas } from "@/three/gravitacion/EscenaOrbitas";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_GRAVITACION, ESCENARIO_ORBITAS, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "9.3",
  titulo: "Satélites y leyes de Kepler",
  nivel: "Gravitación universal",
  nivelNum: 9,
  intro: (
    <>
      Todos los satélites de un mismo planeta cumplen la <b>tercera ley de Kepler</b>: T² ∝ r³, así que los lejanos tardan mucho más en dar la vuelta. Y van más lentos: <b>v = √(GM/r)</b>; en la Tierra, un satélite rasante va a <b>8 km/s</b>. Propón el valor: un <b>satélite fantasma</b> girará con él junto al real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡lanza! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Períodos con Kepler. La tecla que brilla te guía.",
    pista: "Velocidad orbital: más lejos, más lento.",
    solo: "Alturas sobre la superficie, fracciones y de todo un poco.",
  },
};

const TECLAS_ORBITA: Record<string, DecoTecla> = {
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  "→": { sub: "+10" },
  "←": { sub: "−10" },
  intro: { sub: "¡lanza!" },
  h: { sub: "pista" },
};

/** «1 día», «27 días», «16 h». */
const conUnidad = (n: number, u: ProblemaOrbita["unidad"]) => `${String(n).replace(".", ",")} ${u === "días" && n === 1 ? "día" : u}`;

const ORDINAL: Record<number, string> = { 2: "mitad", 3: "tercera parte", 4: "cuarta parte", 9: "novena parte" };
const dec = (n: number) => String(n).replace(".", ",");

/** La órbita pedida en palabras: «un radio 4 veces mayor», «la cuarta parte del radio», «un radio de 16R». */
function radioPedido(p: ProblemaOrbita): string {
  if (p.rasante) return `un radio de ${p.q}R`;
  const [a, b] = fraccionQ(p.q);
  if (b === 1) return `un radio ${a} veces mayor`;
  if (a === 1 && ORDINAL[b]) return `la ${ORDINAL[b]} del radio`;
  return `un radio ${a}/${b} veces mayor`;
}

/** «r₂ = 4r₁», «r₂ = r₁/9», «r₂ = 9r₁/4» o «r = 16R». */
function textoPedida(p: ProblemaOrbita): string {
  if (p.rasante) return `r = ${p.q}R`;
  const [a, b] = fraccionQ(p.q);
  return `r₂ = ${a === 1 ? "" : a}r₁${b === 1 ? "" : `/${b}`}`;
}

const textoRef = (p: ProblemaOrbita) => (p.tipo === "T" ? `T₁ = ${conUnidad(p.ref, p.unidad)}` : p.rasante ? `rasante · ${p.ref} km/s` : `v₁ = ${p.ref} km/s`);

/** La cuenta completa: «T = 2 · 4^(3/2) = 2 · 8 = 16 h» o «v = 8 / √4 = 4 km/s». */
function cuenta(p: ProblemaOrbita): string {
  const [a, b] = fraccionQ(p.q);
  const ra = Math.round(Math.sqrt(a));
  const rb = Math.round(Math.sqrt(b));
  if (p.tipo === "T") {
    const factor = b === 1 ? `${ra ** 3}` : `${ra ** 3}/${rb ** 3}`;
    return `T = ${p.ref} · ${factor} = ${conUnidad(p.respuesta, p.unidad)}`;
  }
  const raiz = b === 1 ? `${ra}` : `(${ra}/${rb})`;
  return `v = ${p.ref} / ${raiz} = ${p.respuesta} km/s`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaOrbitas() {
  const motor = useEtapa<ProblemaOrbita>({ clave: "n9-orbitas", rondas: RONDAS_ORBITAS, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // se parte del dato de referencia: el alumno lo corrige según la nueva órbita
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.ref;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const unidad = p.unidad;
  const nombre = p.tipo === "T" ? "período" : "velocidad";

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(O_MIN, Math.min(O_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const lanzar = () => {
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
      // el fantasma gira más rápido si su período es menor o su velocidad mayor
      const rapido = p.tipo === "T" ? v < p.respuesta : v > p.respuesta;
      const mayor = v < p.respuesta;
      setFb({ clave, tipo: "mal", texto: `El fantasma ${rapido ? "se adelantó" : "se quedó atrás"}: ${p.tipo === "T" ? "el período real" : "la velocidad real"} es ${mayor ? "mayor" : "menor"} que ${conUnidad(v, unidad)}.` });
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
    } else if (e.key === "Enter") lanzar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_GRAVITACION}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaOrbitas
            tipo={p.tipo}
            q={p.q}
            dato={p.ref}
            real={p.respuesta}
            fantasma={v}
            rasante={p.rasante}
            textoRef={textoRef(p)}
            textoPedida={exito ? `${textoPedida(p)} · ${p.tipo === "T" ? "T₂" : "v"} = ${conUnidad(p.respuesta, unidad)}` : textoPedida(p)}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaOrbitas tipo={it.tipo} q={it.q} dato={it.ref} real={it.respuesta} fantasma={null} rasante={it.rasante} textoRef="" textoPedida="" previa={rol === "siguiente" ? textoRef(it) : ""} />
        )
      }
    />
  );

  // con alturas: r = R + h, así que h = (r − 1)R
  const alturaRef = p.r1R ? p.r1R - 1 : 0;
  const alturaPed = p.r1R ? p.r1R * p.q - 1 : 0;
  const enunciado =
    p.tipo === "T" ? (
      p.r1R ? (
        <>
          Un satélite orbita a una altura <b>h = {alturaRef === 1 ? "R" : `${alturaRef}R`}</b> sobre la superficie con un período de <b>{conUnidad(p.ref, unidad)}</b>. ¿Cuál es el período de otro que orbita a una altura <b>h = {alturaPed}R</b>?
        </>
      ) : (
        <>
          Un satélite gira alrededor de un planeta con un período de <b>{conUnidad(p.ref, unidad)}</b>. ¿Cuál es el período de otro satélite cuya órbita tiene <b>{radioPedido(p)}</b>?
        </>
      )
    ) : p.rasante ? (
      <>
        Un satélite rasante (en órbita justo sobre la superficie terrestre) va a <b>8 km/s</b>. ¿Con qué velocidad orbita un satélite {p.r1R ? <>a una altura <b>h = {alturaPed}R</b></> : <>cuya órbita tiene <b>{radioPedido(p)}</b></>}?
      </>
    ) : (
      <>
        Un satélite orbita con <b>{p.ref} km/s</b>. ¿Con qué velocidad orbita otro satélite del mismo planeta cuya órbita tiene <b>{radioPedido(p)}</b>?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>{p.tipo === "T" ? "T" : "v"}</V>₁ <b>{conUnidad(p.ref, unidad)}</b>
        </span>
        <span className="var-chip">
          <b>{textoPedida(p)}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.tipo === "T" ? F_KEPLER : F_V_ORBITAL}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={lanzar} disabled={!motor.jugando || corriendo}>
            ¡Lanza!
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
          simbolo={p.tipo === "T" ? "T" : "v"}
          valor={dec(v)}
          unidad={v === 1 && unidad === "días" ? "día" : unidad}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label={`Subir el ${nombre}`}>
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label={`Bajar el ${nombre}`}>
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_ORBITA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ORBITAS, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para lanzar</span>}
    />
  );
}
