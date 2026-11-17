// ══ Etapa 3.3 · Frena a tiempo (MRUV): ajusta la aceleración con ↑ ↓ y deja que la simulación lo compruebe ───────
import { useState } from "react";
import { COLOR_AUTO, F_DISTANCIA, F_TORRICELLI, RONDAS_MRUV, type ProblemaMRUV } from "@/contenido/nivel-03/cinematica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPista, type MarcaPista } from "@/three/pista/EscenaPista";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_PISTA, ESCENARIO_PISTA, fmtNum, simularTecla, TECLAS_ACELERACION, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "3.3",
  titulo: "Frena a tiempo",
  nivel: "Cinemática I",
  nivelNum: 3,
  intro: (
    <>
      En el <b>MRUV</b> la rapidez cambia lo mismo cada segundo: eso es la aceleración. Ajusta la aceleración con las flechas y pulsa Enter: frena justo antes del muro, cruza la meta a la rapidez pedida o llega a la marca a tiempo.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la aceleración (0,5 m/s²)" },
    { teclas: ["⏎"], texto: "¡corre! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/3/examen", titulo: "Etapa 3.4 · Examen" },
  descRondas: {
    guiado: "La tecla que brilla te lleva al valor correcto: ajústalo y corre.",
    pista: "Tienes la fórmula; despeja la aceleración.",
    solo: "Solo los datos. Calcula, ajusta y corre.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const MIN = 0.5;
const MAX = 10;

/** Tiempo físico que dura la corrida según el tipo y la aceleración elegida. */
function duracion(p: ProblemaMRUV, a: number): number {
  if (p.tipo === "distancia") return p.t ?? 1;
  if (p.tipo === "meta") return (-p.v0 + Math.sqrt(p.v0 * p.v0 + 2 * a * p.d)) / a;
  const parada = (p.v0 * p.v0) / (2 * a);
  if (parada <= p.d) return p.v0 / a;
  // choca: tiempo hasta el muro y un poco más para ver el golpe
  return (p.v0 - Math.sqrt(Math.max(0, p.v0 * p.v0 - 2 * a * p.d))) / a + 0.4;
}

function marcasDe(p: ProblemaMRUV): MarcaPista[] {
  if (p.tipo === "frenar") return [{ x: p.d, tipo: "muro", etiqueta: `muro · ${p.d} m` }];
  if (p.tipo === "meta") return [{ x: p.d, tipo: "meta", etiqueta: `meta · ${p.vf} m/s` }];
  return [{ x: p.d, tipo: "linea", etiqueta: `marca · ${p.d} m` }];
}

const pregunta = (p: ProblemaMRUV) =>
  p.tipo === "frenar"
    ? "¿Con qué desaceleración se detiene justo antes del muro?"
    : p.tipo === "meta"
      ? `¿Qué aceleración necesita para cruzar la meta a ${p.vf} m/s?`
      : `Parte del reposo: ¿qué aceleración necesita para llegar a la marca en ${p.t} s?`;

export default function EtapaFrenado() {
  const motor = useEtapa<ProblemaMRUV>({ clave: "n3-frenado", rondas: RONDAS_MRUV, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", a: 1 });
  const a = st.clave === clave ? st.a : 1;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const cada = p.L > 100 ? 20 : 10;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, a: Math.max(MIN, Math.min(MAX, a + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const correr = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (Math.abs(a - p.respuesta) < 1e-9) {
      motor.acierto();
      const t = p.tipo === "frenar" ? "¡Justo! Se detiene antes del muro." : p.tipo === "meta" ? `¡Exacto! Cruza la meta a ${p.vf} m/s.` : "¡Exacto! Llega a la marca a tiempo.";
      setFb({ clave, tipo: "ok", texto: `${t} a = ${fmtNum(p.respuesta)} m/s².` });
      return;
    }
    motor.error();
    let texto = "";
    if (p.tipo === "frenar") {
      const s = (p.v0 * p.v0) / (2 * a);
      texto = a < p.respuesta ? `¡Chocó! Con a = ${fmtNum(a)} necesitaba ${fmtNum(s)} m para frenar.` : `Frenó antes: se detuvo a ${fmtNum(s)} m y el muro está en ${p.d} m.`;
    } else if (p.tipo === "meta") {
      texto = `Cruzó la meta a ${fmtNum(Math.sqrt(p.v0 * p.v0 + 2 * a * p.d))} m/s; se pedía ${p.vf} m/s.`;
    } else {
      texto = `En ${p.t} s recorrió ${fmtNum(0.5 * a * (p.t ?? 0) ** 2)} m; la marca está en ${p.d} m.`;
    }
    setFb({ clave, tipo: "mal", texto });
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: p.pistas[n - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") (e.preventDefault(), cambiar(0.5));
    else if (e.key === "ArrowDown") (e.preventDefault(), cambiar(-0.5));
    else if (e.key === "Enter") correr();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (a < p.respuesta ? "↑" : a > p.respuesta ? "↓" : "intro") : null;
  const signo = p.tipo === "frenar" ? -1 : 1;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_PISTA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPista
            L={p.L}
            cada={cada}
            moviles={[{ color: COLOR_AUTO.A, x0: 0, v: p.v0, a: signo * a }]}
            marcas={marcasDe(p)}
            corrida={enCurso ? { id: enCurso.id, tFin: duracion(p, a) } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaPista L={it.L} moviles={[{ color: COLOR_AUTO.A, x0: 0, v: it.v0 }]} marcas={marcasDe(it)} previa={rol !== "siguiente" ? "" : it.tipo === "frenar" ? "frenar" : it.tipo === "meta" ? "meta" : "a tiempo"} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{pregunta(p)}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <span className="chip-sym"><V>v</V><Sub>0</Sub></span> <b style={{ color: COLOR_AUTO.A }}>{p.dato ?? `${p.v0} m/s`}</b>
        </span>
        <span className="var-chip">
          <V>d</V> <b>{p.d} m</b>
        </span>
        {p.vf !== undefined && (
          <span className="var-chip">
            <V>v</V> <b>{p.vf} m/s</b>
          </span>
        )}
        {p.t !== undefined && (
          <span className="var-chip">
            <V>t</V> <b>{p.t} s</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>
        {verFormula ? <Formula tam="l">{p.tipo === "distancia" ? F_DISTANCIA : F_TORRICELLI}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}
      </div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-0.5)} disabled={!motor.jugando}>
            − a
          </button>
          <button className="btn" onClick={() => cambiar(0.5)} disabled={!motor.jugando}>
            + a
          </button>
          <button className="btn btn-pri" onClick={correr} disabled={!motor.jugando || corriendo}>
            ¡Corre!
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
          simbolo="a"
          valor={fmtNum(a)}
          unidad="m/s²"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(0.5)} aria-label="Subir aceleración">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-0.5)} aria-label="Bajar aceleración">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_ACELERACION} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PISTA, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la aceleración · Enter para correr</span>}
    />
  );
}
