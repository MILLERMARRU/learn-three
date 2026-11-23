// ══ Etapa 4.3 · Tiro parabólico (MPCL): ajusta la rapidez o elige el ángulo para dar en el blanco ───────
import { useState } from "react";
import { ANGULOS, F_ALCANCE, RONDAS_PARABOLICO, type ProblemaParabolico } from "@/contenido/nivel-04/tiros";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { tSuelo, type Lanzamiento } from "@/lib/tiro";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaTiro } from "@/three/tiro/EscenaTiro";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TIRO, ESCENARIO_TIRO, fmtNum, simularTecla, TECLAS_ANGULO, TECLAS_RAPIDEZ, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "4.3",
  titulo: "Tiro parabólico",
  nivel: "Cinemática II",
  nivelNum: 4,
  intro: (
    <>
      Un proyectil sube y baja (caída libre) mientras avanza con MRU: su trayectoria es una <b>parábola</b>. Su alcance es D = v₀² sen 2θ / g. A veces ajustas la rapidez y otras eliges el ángulo: ¡da en el blanco!
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "rapidez de salida (5 m/s)" },
    { teclas: ["←", "→"], texto: "ángulo de tiro (30° · 37° · 45° · 53° · 60°)" },
    { teclas: ["⏎"], texto: "¡fuego! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/4/examen", titulo: "Etapa 4.4 · Examen" },
  descRondas: {
    guiado: "La trayectoria punteada muestra el tiro correcto y la tecla que brilla te guía.",
    pista: "Tienes la fórmula del alcance; recuerda sen 37° = 0,6 y cos 37° = 0,8.",
    solo: "Solo los datos. Calcula, ajusta y dispara.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const MIN = 5;
const MAX = 60;

const lanzDe = (v: number, angulo: number): Lanzamiento => ({ x0: 0, y0: 0, v, angulo });

export default function EtapaParabolico() {
  const motor = useEtapa<ProblemaParabolico>({ clave: "n4-parabolico", rondas: RONDAS_PARABOLICO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const porAngulo = p.tipo === "angulo";
  const [st, setSt] = useState({ clave: "", v: 10, ai: 0 });
  const v = porAngulo ? p.v0 : st.clave === clave ? st.v : 10;
  const ai = st.clave === clave ? st.ai : 0;
  const angulo = porAngulo ? ANGULOS[ai] : p.angulo;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const lanz = lanzDe(v, angulo);
  const acierta = porAngulo ? p.validos.includes(angulo) : v === p.respuesta;

  const fijar = (nv: number, nai: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(MIN, Math.min(MAX, nv)), ai: Math.max(0, Math.min(ANGULOS.length - 1, nai)) });
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
    if (acierta) {
      motor.acierto();
      const texto = porAngulo
        ? p.validos.length > 1
          ? `¡Al blanco con ${angulo}°! 37° y 53° dan el mismo alcance.`
          : `¡Al blanco! Con ${angulo}° se logra el mayor alcance.`
        : `¡Al blanco! D = ${v}² · sen ${2 * angulo}° / 10 = ${p.D} m.`;
      setFb({ clave, tipo: "ok", texto });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Cayó a ${fmtNum(q.x)} m; el blanco está a ${p.D} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const k = e.key;
    if (!porAngulo && k === "ArrowUp") { e.preventDefault(); fijar(v + 5, ai); }
    else if (!porAngulo && k === "ArrowDown") { e.preventDefault(); fijar(v - 5, ai); }
    else if (porAngulo && k === "ArrowRight") { e.preventDefault(); fijar(v, ai + 1); }
    else if (porAngulo && k === "ArrowLeft") { e.preventDefault(); fijar(v, ai - 1); }
    else if (k === "Enter") disparar();
    else if (k.toLowerCase() === "h" || k === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  let siguienteTecla: string | null = null;
  if (guiado && motor.jugando && !corriendo) {
    if (porAngulo) {
      const objetivo = ANGULOS.indexOf(p.validos.reduce((a, b) => (Math.abs(ANGULOS.indexOf(b) - ai) < Math.abs(ANGULOS.indexOf(a) - ai) ? b : a)));
      siguienteTecla = ai < objetivo ? "→" : ai > objetivo ? "←" : "intro";
    } else siguienteTecla = v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro";
  }

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
            canasta={p.D}
            guia={guiado ? lanzDe(porAngulo ? p.v0 : p.respuesta, porAngulo ? p.validos[0] : p.angulo) : null}
            corrida={enCurso ? { id: enCurso.id, tFin: tSuelo(lanz) } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaTiro W={it.W} H={it.H} lanz={lanzDe(it.tipo === "angulo" ? it.v0 : 10, it.tipo === "angulo" ? 30 : it.angulo)} canasta={it.D} previa={rol === "siguiente" ? (it.tipo === "angulo" ? "elige el ángulo" : `${it.angulo}° · ${it.D} m`) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{porAngulo ? "¿Con qué ángulo hay que disparar para dar en el blanco?" : "¿Con qué rapidez hay que disparar para dar en el blanco?"}</p>
      <div className="variables" key={clave}>
        {porAngulo ? (
          <span className="var-chip">
            <span className="chip-sym">
              <V>v</V>
              <Sub>0</Sub>
            </span>{" "}
            <b>{p.v0} m/s</b>
          </span>
        ) : (
          <span className="var-chip">
            <V>θ</V> <b>{p.angulo}°</b>
          </span>
        )}
        <span className="var-chip">
          <V>D</V> <b>{p.D} m</b>
        </span>
        <span className="var-chip">
          <V>g</V> <b>10 m/s²</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_ALCANCE}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => (porAngulo ? fijar(v, ai - 1) : fijar(v - 5, ai))} disabled={!motor.jugando}>
            {porAngulo ? "− θ" : "− v₀"}
          </button>
          <button className="btn" onClick={() => (porAngulo ? fijar(v, ai + 1) : fijar(v + 5, ai))} disabled={!motor.jugando}>
            {porAngulo ? "+ θ" : "+ v₀"}
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
        porAngulo ? (
          <ValorTexto
            simbolo="θ"
            valor={`${angulo}`}
            unidad="°"
            ok={exito}
            mal={retro?.tipo === "mal"}
            extra={
              <span className="ajuste ajuste-h">
                <button className="slot-arr" onClick={() => fijar(v, ai - 1)} aria-label="Bajar ángulo">
                  ◀
                </button>
                <button className="slot-arr" onClick={() => fijar(v, ai + 1)} aria-label="Subir ángulo">
                  ▶
                </button>
              </span>
            }
          />
        ) : (
          <ValorTexto
            simbolo={
              <>
                v<Sub>0</Sub>
              </>
            }
            valor={String(v)}
            unidad="m/s"
            ok={exito}
            mal={retro?.tipo === "mal"}
            extra={
              <span className="ajuste">
                <button className="slot-arr" onClick={() => fijar(v + 5, ai)} aria-label="Subir rapidez">
                  ▲
                </button>
                <button className="slot-arr" onClick={() => fijar(v - 5, ai)} aria-label="Bajar rapidez">
                  ▼
                </button>
              </span>
            }
          />
        )
      }
      teclado={<TecladoVirtual activas={porAngulo ? TECLAS_ANGULO : TECLAS_RAPIDEZ} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_TIRO, vista: clave }}
      pieEscena={<span>{porAngulo ? "← → elige el ángulo" : "↑ ↓ ajusta la rapidez"} · Enter para disparar</span>}
    />
  );
}
