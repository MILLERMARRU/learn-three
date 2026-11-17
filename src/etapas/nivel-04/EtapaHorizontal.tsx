// ══ Etapa 4.2 · Lanzamiento horizontal: ajusta la rapidez para encestar desde lo alto del acantilado ───────
import { useState } from "react";
import { F_HORIZONTAL, RONDAS_HORIZONTAL, type ProblemaHorizontal } from "@/contenido/nivel-04/tiros";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { tSuelo, type Lanzamiento } from "@/lib/tiro";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaTiro } from "@/three/tiro/EscenaTiro";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TIRO, ESCENARIO_TIRO, fmtNum, simularTecla, TECLAS_RAPIDEZ, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "4.2",
  titulo: "Lanzamiento horizontal",
  nivel: "Cinemática II",
  nivelNum: 4,
  intro: (
    <>
      Un lanzamiento horizontal son <b>dos movimientos a la vez</b> (Galileo): en horizontal avanza con MRU y en vertical cae libremente. El tiempo de caída solo depende de la altura. Ajusta la rapidez y ¡encesta!
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la rapidez (5 m/s)" },
    { teclas: ["⏎"], texto: "¡fuego! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/4/parabolico", titulo: "Etapa 4.3 · Tiro parabólico" },
  descRondas: {
    guiado: "La trayectoria punteada muestra el tiro correcto y la tecla que brilla te guía.",
    pista: "Tienes las fórmulas: primero el tiempo de caída, luego la rapidez.",
    solo: "Solo los datos. Calcula, ajusta y dispara.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const MIN = 5;
const MAX = 40;

const lanzDe = (p: ProblemaHorizontal, v: number): Lanzamiento => ({ x0: 0, y0: p.altura, v, angulo: 0 });

export default function EtapaHorizontal() {
  const motor = useEtapa<ProblemaHorizontal>({ clave: "n4-horizontal", rondas: RONDAS_HORIZONTAL, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: MIN });
  const v = st.clave === clave ? st.v : MIN;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const lanz = lanzDe(p, v);
  const tCaida = tSuelo(lanz);

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(MIN, Math.min(MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const disparar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = (q: { x: number }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Encestó! Cae en ${fmtNum(tCaida)} s y avanza ${v} · ${fmtNum(tCaida)} = ${p.D} m.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Cayó a ${fmtNum(q.x)} m del pie del acantilado; la canasta está a ${p.D} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") (e.preventDefault(), cambiar(5));
    else if (e.key === "ArrowDown") (e.preventDefault(), cambiar(-5));
    else if (e.key === "Enter") disparar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_TIRO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaTiro
            W={p.W}
            H={p.H}
            lanz={lanz}
            torre={p.altura}
            canasta={p.D}
            guia={guiado ? lanzDe(p, p.respuesta) : null}
            corrida={enCurso ? { id: enCurso.id, tFin: tCaida } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaTiro W={it.W} H={it.H} lanz={lanzDe(it, MIN)} torre={it.altura} canasta={it.D} previa={rol === "siguiente" ? `${it.altura} m · ${it.D} m` : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">¿Con qué rapidez horizontal hay que lanzar para encestar?</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>H</V> <b>{p.altura} m</b>
        </span>
        <span className="var-chip">
          <V>D</V> <b>{p.D} m</b>
        </span>
        <span className="var-chip">
          <V>g</V> <b>10 m/s²</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_HORIZONTAL}</Formula> : <span className="oculta-txt">Fórmulas ocultas · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-5)} disabled={!motor.jugando}>
            − v
          </button>
          <button className="btn" onClick={() => cambiar(5)} disabled={!motor.jugando}>
            + v
          </button>
          <button className="btn btn-pri" onClick={disparar} disabled={!motor.jugando || corriendo}>
            ¡Fuego!
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
              <button className="slot-arr" onClick={() => cambiar(5)} aria-label="Subir rapidez">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-5)} aria-label="Bajar rapidez">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_RAPIDEZ} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_TIRO, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la rapidez · Enter para disparar</span>}
    />
  );
}
