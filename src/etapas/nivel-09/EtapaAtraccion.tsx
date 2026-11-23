// ══ Etapa 9.1 · Ley de gravitación universal: ajusta la nueva fuerza de atracción y compárala con la real ───────
import { useState } from "react";
import { conFactor, F_GRAVITACION, F_MAX, F_MIN, RONDAS_ATRACCION, type ProblemaAtraccion } from "@/contenido/nivel-09/atraccion";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaAtraccion } from "@/three/gravitacion/EscenaAtraccion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_GRAVITACION, ESCENARIO_ATRACCION, fraccion, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "9.1",
  titulo: "Ley de gravitación universal",
  nivel: "Gravitación universal",
  nivelNum: 9,
  intro: (
    <>
      Dos masas cualesquiera se atraen con una fuerza <b>F = G·m₁·m₂/d²</b>: proporcional a cada masa e inversamente proporcional al <b>cuadrado</b> de la distancia. Te damos la fuerza de una situación inicial; cambian las masas o la distancia y tú ajustas la nueva fuerza. Al soltar, crecen las <b>flechas reales</b> junto a las tuyas.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta la fuerza de 1 en 1 N" },
    { teclas: ["←", "→"], texto: "de 10 en 10 N" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/9/gravedad", titulo: "Etapa 9.2 · Gravedad en la altura y en otros planetas" },
  descRondas: {
    guiado: "Un solo cambio. La tecla que brilla te guía.",
    pista: "Dos cambios a la vez: multiplica sus efectos.",
    solo: "Varios cambios y fracciones; la fórmula se oculta.",
  },
};

const TECLAS_GRAV: Record<string, DecoTecla> = {
  "↑": { sub: "+1 N" },
  "↓": { sub: "−1 N" },
  "→": { sub: "+10 N" },
  "←": { sub: "−10 N" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

/** Cómo cambia un factor, en singular y en plural. */
const VERBO: Record<string, [string, string]> = {
  "2": ["se duplica", "se duplican"],
  "3": ["se triplica", "se triplican"],
  "4": ["se cuadruplica", "se cuadruplican"],
  "0.5": ["se reduce a la mitad", "se reducen a la mitad"],
  "1.5": ["aumenta en un 50 %", "aumentan en un 50 %"],
};

/** Los cambios del enunciado: «la masa m₁ se duplica y la distancia se triplica». */
function cambios(p: ProblemaAtraccion): string {
  const v = (k: number, plural = false) => VERBO[String(k)]?.[plural ? 1 : 0] ?? `se multiplica por ${fraccion(k)}`;
  const lista: string[] = [];
  if (p.k1 !== 1 && p.k1 === p.k2) lista.push(`ambas masas ${v(p.k1, true)}`);
  else {
    if (p.k1 !== 1) lista.push(`la masa m₁ ${v(p.k1)}`);
    if (p.k2 !== 1) lista.push(`la masa m₂ ${v(p.k2)}`);
  }
  if (p.kd !== 1) lista.push(`la distancia ${v(p.kd)}`);
  return lista.length > 1 ? `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}` : lista[0];
}

/** La cuenta completa: «F = 18 · 2 / 3² = 4 N». */
function cuenta(p: ProblemaAtraccion): string {
  const masas = [p.k1, p.k2].filter((k) => k !== 1).map((k) => ` · ${fraccion(k)}`).join("");
  const kd = fraccion(p.kd);
  const dist = p.kd === 1 ? "" : ` / ${kd.includes("/") ? `(${kd})` : kd}²`;
  return `F = ${p.F0}${masas}${dist} = ${p.respuesta} N`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaAtraccion() {
  const motor = useEtapa<ProblemaAtraccion>({ clave: "n9-atraccion", rondas: RONDAS_ATRACCION, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  // se parte de la fuerza inicial: el alumno la corrige según los cambios
  const v = st.clave === clave ? st.v : p.F0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡Exacto! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Las flechas reales salieron más ${v > p.respuesta ? "cortas" : "largas"}: la fuerza real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} N.` });
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
      {...CARRUSEL_GRAVITACION}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaAtraccion F0={p.F0} k1={p.k1} k2={p.k2} kd={p.kd} F={v} Freal={p.respuesta} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaAtraccion F0={it.F0} k1={it.k1} k2={it.k2} kd={it.kd} F={null} Freal={it.respuesta} previa={rol === "siguiente" ? `F₀ = ${it.F0} N` : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        Dos esferas de masas m₁ y m₂, separadas una distancia d, se atraen con <b>{p.F0} N</b>. Si {cambios(p)}, ¿con qué fuerza se atraen ahora?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>F</V>₀ <b>{p.F0} N</b>
        </span>
        <span className="var-chip">
          <b>{conFactor(p.k1, "m₁")}</b>
        </span>
        <span className="var-chip">
          <b>{conFactor(p.k2, "m₂")}</b>
        </span>
        <span className="var-chip">
          <b>{conFactor(p.kd, "d")}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_GRAVITACION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="F"
          valor={String(v)}
          unidad="N"
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
      teclado={<TecladoVirtual activas={TECLAS_GRAV} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ATRACCION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 N · ← → de 10 N · Enter para soltar</span>}
    />
  );
}
