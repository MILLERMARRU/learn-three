// ══ Etapa 4.1 · Caída libre (MVCL): pon la marca donde estará la pelota y mírala subir, frenar y caer ───────
import { useState } from "react";
import { F_CAIDA, F_HMAX, RONDAS_CAIDA, duracionCaida, type ProblemaCaida } from "@/contenido/nivel-04/tiros";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import type { Lanzamiento } from "@/lib/tiro";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaTiro } from "@/three/tiro/EscenaTiro";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TIRO, ESCENARIO_TIRO, fmtNum, simularTecla, TECLAS_MARCA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "4.1",
  titulo: "Caída libre",
  nivel: "Cinemática II",
  nivelNum: 4,
  intro: (
    <>
      En la <b>caída libre</b> todo cuerpo acelera hacia abajo con g = 10 m/s²: al subir pierde 10 m/s cada segundo y al bajar los gana. Pon la marca donde estará la pelota y pulsa Enter para lanzarla.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "clic o arrastre en la escena para la marca" },
    { teclas: ["↑", "↓"], texto: "mueve la marca de 5 en 5 m" },
    { teclas: ["⏎"], texto: "¡lanza! y comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/4/horizontal", titulo: "Etapa 4.2 · Lanzamiento horizontal" },
  descRondas: {
    guiado: "La marca fantasma señala la altura: lleva la tuya hasta allí y lanza.",
    pista: "Tienes la fórmula a la vista; la marca la pones tú.",
    solo: "Solo los datos. Calcula, pon la marca y lanza.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;

const anchoCampo = (p: ProblemaCaida) => Math.round(p.H * 0.7);
const lanzDe = (p: ProblemaCaida): Lanzamiento => ({ x0: anchoCampo(p) * 0.62, y0: p.y0, v: p.v0, angulo: p.tipo === "abajo" ? -90 : 90 });

function enunciado(p: ProblemaCaida) {
  const desde =
    p.tipo === "suelta"
      ? `Se suelta desde ${p.y0} m.`
      : p.tipo === "abajo"
        ? `Se lanza hacia abajo con ${p.v0} m/s desde ${p.y0} m.`
        : p.y0 > 0
          ? `Desde ${p.y0} m se lanza hacia arriba con ${p.v0} m/s.`
          : `Se lanza hacia arriba con ${p.v0} m/s.`;
  return `${desde} ${p.t === null ? "¿Qué altura máxima alcanza?" : `¿A qué altura estará a los ${p.t} s?`}`;
}

export default function EtapaCaida() {
  const motor = useEtapa<ProblemaCaida>({ clave: "n4-caida", rondas: RONDAS_CAIDA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", y: 0 });
  const y = st.clave === clave ? st.y : p.y0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const verFantasma = guiado || motor.pistas >= 3;

  const poner = (ny: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null); // la pelota vuelve a su lugar
    setSt({ clave, y: Math.max(0, Math.min(p.H, ny)) });
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const lanzar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = (q: { y: number }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (y === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: p.t === null ? `¡Exacto! Sube hasta ${p.respuesta} m y ahí su velocidad es 0.` : `¡Exacto! A los ${p.t} s está a ${p.respuesta} m del suelo.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La pelota llegó a ${fmtNum(q.y, 0)} m; tu marca estaba en ${y} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: n >= 3 ? "La marca fantasma señala la altura." : p.pistas[n - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") { e.preventDefault(); poner(y + PASO); sfx.tecla(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); poner(y - PASO); sfx.tecla(); }
    else if (e.key === "Enter") lanzar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (y < p.respuesta ? "↑" : y > p.respuesta ? "↓" : "intro") : null;
  const flecha = p.tipo === "arriba" ? " ↑" : p.tipo === "abajo" ? " ↓" : "";

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_TIRO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaTiro
            W={anchoCampo(p)}
            H={p.H}
            lanz={lanzDe(p)}
            torre={p.y0}
            reglaX={false}
            marca={{ y, editable: motor.jugando && !corriendo, onCambio: poner, paso: PASO }}
            fantasma={verFantasma ? p.respuesta : null}
            corrida={enCurso ? { id: enCurso.id, tFin: duracionCaida(p) } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaTiro W={anchoCampo(it)} H={it.H} lanz={lanzDe(it)} torre={it.y0} reglaX={false} previa={rol === "siguiente" ? (it.t === null ? "altura máxima" : `a los ${it.t} s`) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado(p)}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <span className="chip-sym">
            <V>y</V>
            <Sub>0</Sub>
          </span>{" "}
          <b>{p.y0} m</b>
        </span>
        <span className="var-chip">
          <span className="chip-sym">
            <V>v</V>
            <Sub>0</Sub>
          </span>{" "}
          <b style={{ color: "#ff8a5c" }}>
            {p.v0} m/s{flecha}
          </b>
        </span>
        <span className="var-chip">
          <V>t</V> <b>{p.t === null ? "hasta v = 0" : `${p.t} s`}</b>
        </span>
        <span className="var-chip">
          <V>g</V> <b>10 m/s²</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.t === null ? F_HMAX : F_CAIDA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 3}>
            Pista <span className="btn-meta">{motor.pistas}/3</span>
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
      respuesta={<ValorTexto simbolo="y" valor={String(y)} unidad="m" ok={exito} mal={retro?.tipo === "mal"} />}
      teclado={<TecladoVirtual activas={TECLAS_MARCA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_TIRO, vista: clave }}
      pieEscena={<span>Haz clic en la escena para poner la marca · Enter para lanzar</span>}
    />
  );
}
