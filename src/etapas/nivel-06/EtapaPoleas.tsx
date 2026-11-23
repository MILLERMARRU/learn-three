// ══ Etapa 6.2 · Poleas y engranajes: ajusta la ω de la última rueda para que la faja no patine ni los dientes choquen ───────
import { useState, type ReactNode } from "react";
import { explicarPoleas, F_TRANSMISION, K_MAX, K_MIN, NOMBRES_RUEDA, RONDAS_POLEAS, type ProblemaPoleas } from "@/contenido/nivel-06/circular";
import { fmtPi } from "@/lib/circular";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRuedas, type Rueda } from "@/three/circular/EscenaRuedas";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_POLEAS, ESCENARIO_POLEAS, simularTecla, TECLAS_OMEGA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "6.2",
  titulo: "Poleas y engranajes",
  nivel: "Movimiento circunferencial",
  nivelNum: 6,
  intro: (
    <>
      Una <b>faja</b> o dos <b>engranajes</b> obligan a que los bordes avancen a la misma rapidez:{" "}
      <b>
        ω<sub>A</sub>R<sub>A</sub> = ω<sub>B</sub>R<sub>B</sub>
      </b>
      , así que la rueda chica gira más rápido (y el engranaje, al revés). Las ruedas fijas al <b>mismo eje</b> giran con la misma ω. Ajusta la ω de la última rueda para que todo gire sincronizado.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja ω (π/4 rad/s)" },
    { teclas: ["⏎"], texto: "¡gira! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Una faja o engranaje: aplica ωA·RA = ωB·RB. La tecla que brilla te guía.",
    pista: "La rapidez del borde se conserva; con el mismo eje se conserva ω.",
    solo: "Trenes de varias ruedas: avanza rueda por rueda.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

/** Separación entre poleas unidas por faja y ancho máximo de la fila (unidades 3D). */
const HUECO = 0.8;
const ANCHO_MAX = 7.6;
const RADIO_MAX = 1.45;
/** Dientes por centímetro de radio: con radios múltiplos de 5 cm el número de dientes guarda la proporción exacta. */
const DIENTES_POR_CM = 0.8;

/** Ruedas en fila, escaladas para caber: la faja deja un hueco, los engranajes casi se tocan y las del mismo eje van encima. */
function ruedasDe(p: ProblemaPoleas, k: number, estado: "ok" | "mal" | null): Rueda[] {
  const n = p.radios.length;
  const anchoCm = p.radios.reduce((s, r, i) => s + (i === 0 || p.uniones[i - 1] !== "eje" ? 2 * r : 0), 0);
  const huecos = p.uniones.filter((u) => u === "faja").length;
  const s = Math.min(RADIO_MAX / Math.max(...p.radios), (ANCHO_MAX - huecos * HUECO) / anchoCm);
  const r = p.radios.map((x) => x * s);
  const xs = [0];
  const fases = [0];
  // radio de la rueda más grande de cada eje: la siguiente polea debe quedar fuera de ella
  const alcance = [r[0]];
  for (let i = 1; i < n; i++) {
    const u = p.uniones[i - 1];
    if (u === "eje") {
      xs.push(xs[i - 1]);
      fases.push(fases[i - 1]);
      alcance.push(Math.max(alcance[i - 1], r[i]));
      alcance[i - 1] = alcance[i];
    } else if (u === "engranaje") {
      alcance.push(r[i]);
      xs.push(xs[i - 1] + r[i - 1] + r[i] + 0.11);
      // un diente de la anterior apunta a esta: esta deja un hueco enfrente (medio paso corrido)
      fases.push(Math.PI + Math.PI / Math.round(p.radios[i] * DIENTES_POR_CM));
    } else {
      xs.push(xs[i - 1] + alcance[i - 1] + HUECO + r[i]);
      fases.push(0);
      alcance.push(r[i]);
    }
  }
  const centro = (Math.min(...xs.map((x, i) => x - r[i])) + Math.max(...xs.map((x, i) => x + r[i]))) / 2;
  const rMax = Math.max(...r);
  const conDientes = (i: number) => p.uniones[i - 1] === "engranaje" || p.uniones[i] === "engranaje";
  return p.radios.map((R, i) => {
    const ultima = i === n - 1;
    const enEje = i > 0 && p.uniones[i - 1] === "eje";
    const kEscena = ultima ? Math.sign(p.ks[i]) * k : p.ks[i];
    return {
      x: xs[i] - centro,
      y: 0,
      r: r[i],
      k: kEscena,
      dientes: conDientes(i) ? Math.round(R * DIENTES_POR_CM) : 0,
      fase: fases[i],
      z: enEje ? 0.2 : 0,
      rotuloArriba: enEje,
      // rótulos alineados bajo la rueda más grande (los de un mismo eje, encima): así no caen sobre otra rueda
      rotuloDist: enEje ? Math.max(r[i], r[i - 1]) : rMax,
      estado: ultima ? estado : null,
      rotulo: `${NOMBRES_RUEDA[i]} · ${R} cm`,
    };
  });
}

/** Fajas entre cada rueda y la siguiente cuando las une una faja. */
const fajasDe = (p: ProblemaPoleas): [number, number][] => p.uniones.flatMap((u, i) => (u === "faja" ? [[i, i + 1] as [number, number]] : []));

const UNION_TXT = { faja: "con una faja", engranaje: "con sus dientes (engranados)", eje: "por el mismo eje" };

function enunciado(p: ProblemaPoleas): ReactNode {
  const ult = NOMBRES_RUEDA[p.radios.length - 1];
  const pasos = p.uniones.map((u, i) => (u === "eje" ? `${NOMBRES_RUEDA[i + 1]} está fija al eje de ${NOMBRES_RUEDA[i]}` : `${NOMBRES_RUEDA[i]} mueve a ${NOMBRES_RUEDA[i + 1]} ${UNION_TXT[u]}`));
  return (
    <>
      La rueda A gira a <b>{fmtPi(p.ks[0], 4)} rad/s</b>. {pasos.join("; ")}. ¿Con qué velocidad angular gira <b>{ult}</b>?
    </>
  );
}

export default function EtapaPoleas() {
  const motor = useEtapa<ProblemaPoleas>({ clave: "n6-poleas", rondas: RONDAS_POLEAS, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const ult = NOMBRES_RUEDA[p.radios.length - 1];
  const [st, setSt] = useState({ clave: "", k: K_MIN });
  const k = st.clave === clave ? st.k : K_MIN;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, k: Math.max(K_MIN, Math.min(K_MAX, k + d)) });
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
    if (k === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Sincronizadas! ${explicarPoleas(p, k)}` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `${explicarPoleas(p, k)} ${k < p.respuesta ? `${ult} gira muy lento: sube ω.` : `${ult} gira muy rápido: baja ω.`}` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cambiar(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-1);
    } else if (e.key === "Enter") girar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (k < p.respuesta ? "↑" : k > p.respuesta ? "↓" : "intro") : null;
  const estado = enCurso?.fin && retro ? (retro.tipo === "ok" ? "ok" : retro.tipo === "mal" ? "mal" : null) : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_POLEAS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRuedas ruedas={ruedasDe(p, k, estado)} fajas={fajasDe(p)} corrida={enCurso ? { id: enCurso.id, tFin: 4 } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaRuedas ruedas={ruedasDe(it, it.respuesta, null)} fajas={fajasDe(it)} previa={rol === "siguiente" ? `${it.radios.length} ruedas · ${it.uniones.join(" + ")}` : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado(p)}</p>
      <div className="variables" key={clave}>
        {p.radios.map((R, i) => (
          <span className="var-chip" key={i}>
            <span>
              <V>R</V>
              <sub>{NOMBRES_RUEDA[i]}</sub>
            </span>{" "}
            <b>{R} cm</b>
          </span>
        ))}
        <span className="var-chip">
          <span>
            <V>ω</V>
            <sub>A</sub>
          </span>{" "}
          <b>{fmtPi(p.ks[0], 4)} rad/s</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_TRANSMISION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − ω
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + ω
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
          simbolo={
            <>
              ω<Sub>{ult}</Sub>
            </>
          }
          valor={fmtPi(k, 4)}
          unidad="rad/s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir velocidad angular">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar velocidad angular">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_OMEGA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_POLEAS, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta ω · Enter para girar</span>}
    />
  );
}
