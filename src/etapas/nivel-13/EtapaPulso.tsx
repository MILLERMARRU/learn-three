// ══ Etapa 13.2 · Velocidad de una onda en una cuerda: un pulso fantasma con la velocidad propuesta viaja junto al real ───────
import { useState } from "react";
import { fmtO, O_MAX, O_MIN } from "@/contenido/nivel-13/onda";
import { F_PULSO, RONDAS_PULSO, type ProblemaPulso } from "@/contenido/nivel-13/pulso";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPulso } from "@/three/ondas/EscenaPulso";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS, ESCENARIO_PULSO, simularTecla, TECLAS_ONDA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "13.2",
  titulo: "Velocidad de una onda en una cuerda",
  nivel: "Ondas mecánicas",
  nivelNum: 13,
  intro: (
    <>
      Si golpeas una cuerda tensa, el pulso viaja con una velocidad que no depende del golpe, sino de la cuerda: <b>v = √(T/μ)</b>. Más tensión T, más rápido; más masa por metro μ (densidad lineal), más lento. Aquí la tensión la da una pesa que cuelga de una polea. Propón la velocidad: un <b>pulso fantasma</b> viajará con ella junto al real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 m/s" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡golpea! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/13/estacionaria", titulo: "Etapa 13.3 · Ondas estacionarias" },
  descRondas: {
    guiado: "v = √(T/μ) con T y μ dados. La tecla que brilla te guía.",
    pista: "La tensión la da la pesa: T = m·g.",
    solo: "Más tensión, cuerdas más pesadas y gramos por metro.",
  },
};

/** La cuenta: «v = √(90/0,1) = 30 m/s» (con la pesa: «T = 4·10 = 40 N → …»). */
function cuenta(p: ProblemaPulso): string {
  const base = `v = √(${fmtO(p.T)}/${fmtO(p.mu)}) = ${p.respuesta} m/s`;
  return p.masa ? `T = ${fmtO(p.masa)}·10 = ${fmtO(p.T)} N → ${base}` : base;
}

const textoCorto = (p: ProblemaPulso) => `T = ${fmtO(p.T)} N · μ = ${fmtO(p.mu)}`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPulso() {
  const motor = useEtapa<ProblemaPulso>({ clave: "n13-pulso", rondas: RONDAS_PULSO, avanceMs: 1900 });
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

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(O_MIN, Math.min(O_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const golpear = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡Llegan juntos! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El pulso fantasma ${v > p.respuesta ? "se adelantó" : "se quedó atrás"}: la velocidad real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m/s.` });
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
    } else if (e.key === "Enter") golpear();
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
          <EscenaPulso T={p.T} mu={p.mu} masa={p.masa} v={p.respuesta} vFantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPulso T={it.T} mu={it.mu} masa={it.masa} v={it.respuesta} vFantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const muTexto = p.mu < 0.01 ? `${fmtO(p.mu * 1000)} g/m` : `${fmtO(p.mu)} kg/m`;
  const enunciado = p.masa ? (
    <>
      Una cuerda de densidad lineal <b>{muTexto}</b> pasa por una polea y sostiene una pesa de <b>{fmtO(p.masa)} kg</b>. Si se golpea el otro extremo, ¿con qué velocidad viaja el pulso? (g = 10 m/s²)
    </>
  ) : (
    <>
      Una cuerda de densidad lineal <b>{muTexto}</b> está tensa con <b>{fmtO(p.T)} N</b>. ¿Con qué velocidad viaja un pulso por ella?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.masa ? (
          <span className="var-chip">
            <V>m</V> <b>{fmtO(p.masa)} kg</b>
          </span>
        ) : (
          <span className="var-chip">
            <V>T</V> <b>{fmtO(p.T)} N</b>
          </span>
        )}
        <span className="var-chip">
          <V>μ</V> <b>{muTexto}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_PULSO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={golpear} disabled={!motor.jugando || corriendo}>
            ¡Golpea!
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
          simbolo="v"
          valor={String(v)}
          unidad="m/s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la velocidad">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la velocidad">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_ONDA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PULSO, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para golpear</span>}
    />
  );
}
