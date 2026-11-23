// ══ Etapa 6.1 · Velocidad angular: ajusta ω para que la marca de la rueda llegue a la meta (θ = ωt) ───────
import { useState, type ReactNode } from "react";
import { F_OMEGA, F_RPM, K_MAX, K_MIN, RONDAS_ANGULAR, textoObjetivo, type ProblemaAngular } from "@/contenido/nivel-06/circular";
import { fmtPi, grados } from "@/lib/circular";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRuedas, type Rueda } from "@/three/circular/EscenaRuedas";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_RUEDA, ESCENARIO_RUEDA, fmtNum, RADIO_RUEDA, simularTecla, TECLAS_OMEGA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "6.1",
  titulo: "Velocidad angular",
  nivel: "Movimiento circunferencial",
  nivelNum: 6,
  intro: (
    <>
      En el <b>MCU</b> la rueda barre ángulos iguales en tiempos iguales. La <b>velocidad angular</b> ω dice cuántos radianes gira por segundo: <b>ω = θ / t</b>. Una vuelta son 2π rad, así que también ω = 2π / T = 2πf. Ajusta ω y lleva la marca hasta la meta.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja ω (π/4 rad/s)" },
    { teclas: ["⏎"], texto: "¡gira! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "La espiral punteada muestra el giro correcto y la tecla que brilla te guía.",
    pista: "Tienes la fórmula: pasa el dato a radianes y divide entre el tiempo.",
    solo: "Solo el dato. Calcula ω, ajústala y haz girar la rueda.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const ruedaDe = (p: ProblemaAngular, k: number): Rueda[] => [{ x: 0, y: 0, r: RADIO_RUEDA, k, objetivo: p.objetivo }];

/** «(3 vueltas)» si el giro es un número entero de vueltas (8 cuartos de π = 1 vuelta). */
const vueltasDe = (cuartos: number) => {
  const v = cuartos / 8;
  return Number.isInteger(Math.round(v * 1e9) / 1e9) && v >= 1 ? ` (${Math.round(v)} ${Math.round(v) === 1 ? "vuelta" : "vueltas"})` : "";
};

function enunciado(p: ProblemaAngular): ReactNode {
  if (p.tipo === "angulo") {
    return (
      <>
        La marca debe girar <b>{fmtPi(p.dato, 4)} rad</b> ({Math.round(grados(p.objetivo))}°) en <b>{fmtNum(p.t)} s</b>. ¿Con qué velocidad angular debe girar la rueda?
      </>
    );
  }
  if (p.tipo === "vueltas") {
    return (
      <>
        La rueda da <b>{p.dato} vueltas</b> en <b>{fmtNum(p.t)} s</b>. ¿Cuál es su velocidad angular?
      </>
    );
  }
  if (p.tipo === "periodo") {
    return (
      <>
        La rueda da una vuelta cada <b>{fmtNum(p.dato)} s</b>: ese es su periodo. ¿Cuál es su velocidad angular?
      </>
    );
  }
  return (
    <>
      La rueda gira a <b>{p.dato} rpm</b> (revoluciones por minuto). ¿Cuál es su velocidad angular?
    </>
  );
}

function chips(p: ProblemaAngular): [ReactNode, string][] {
  if (p.tipo === "angulo") return [[<V key="v">θ</V>, `${fmtPi(p.dato, 4)} rad`], [<V key="v">t</V>, `${fmtNum(p.t)} s`]];
  if (p.tipo === "vueltas") return [[<V key="v">N</V>, `${p.dato} vueltas`], [<V key="v">t</V>, `${fmtNum(p.t)} s`]];
  if (p.tipo === "periodo") return [[<V key="v">T</V>, `${fmtNum(p.dato)} s`], [<>prueba</>, `${fmtNum(p.t)} s`]];
  return [[<V key="v">f</V>, `${p.dato} rpm`], [<>prueba</>, `${fmtNum(p.t)} s`]];
}

/** Rótulo de la vista previa del carrusel. */
function textoCorto(p: ProblemaAngular): string {
  if (p.tipo === "angulo") return `${fmtPi(p.dato, 4)} rad en ${fmtNum(p.t)} s`;
  if (p.tipo === "vueltas") return `${p.dato} vueltas en ${fmtNum(p.t)} s`;
  if (p.tipo === "periodo") return `T = ${fmtNum(p.dato)} s`;
  return `${p.dato} rpm`;
}

export default function EtapaAngular() {
  const motor = useEtapa<ProblemaAngular>({ clave: "n6-angular", rondas: RONDAS_ANGULAR, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
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
    const giro = k * p.t; // en cuartos de π
    if (k === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡En la meta! Con ω = ${fmtPi(k, 4)} rad/s, en ${fmtNum(p.t)} s gira θ = ${fmtPi(giro, 4)} rad${vueltasDe(giro)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Giró ${fmtPi(giro, 4)} rad${vueltasDe(giro)}; debía girar ${textoObjetivo(p)}. ${k < p.respuesta ? "Le faltó: sube ω." : "Se pasó: baja ω."}` });
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

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_RUEDA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRuedas ruedas={ruedaDe(p, k)} guia={guiado ? p.objetivo : null} corrida={enCurso ? { id: enCurso.id, tFin: p.t } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaRuedas ruedas={ruedaDe(it, K_MIN)} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado(p)}</p>
      <div className="variables" key={clave}>
        {chips(p).map(([s, v], i) => (
          <span className="var-chip" key={i}>
            {s} <b>{v}</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.tipo === "rpm" ? F_RPM : F_OMEGA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="ω"
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
      escenario={{ ...ESCENARIO_RUEDA, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta ω · Enter para girar</span>}
    />
  );
}
