// ══ Etapa 8.3 · Sistemas de bloques: aceleración del sistema (con fantasmas) o tensión de la cuerda (con dinamómetro) ───────
import { useState } from "react";
import { F_ATWOOD, F_MESA, RONDAS_SISTEMAS, type ProblemaSistema } from "@/contenido/nivel-08/sistemas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaSistema } from "@/three/dinamica/EscenaSistema";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { ESCENARIO_PLANO, fmtNum, simularTecla, ValorTexto, CARRUSEL_DINAMICA } from "./comun";

const META: MetaEtapa = {
  numero: "8.3",
  titulo: "Sistemas de bloques",
  nivel: "Dinámica",
  nivelNum: 8,
  intro: (
    <>
      Dos bloques unidos por una cuerda se mueven juntos, con la <b>misma aceleración</b>. Míralos como un solo cuerpo: la fuerza que los mueve dividida entre la masa total. En la <b>máquina de Atwood</b> la mueve la diferencia de pesos; en la <b>mesa</b>, el peso del que cuelga menos el rozamiento. La tensión sale de aplicar ΣF = m·a a uno solo.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la aceleración o la tensión" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/8/examen", titulo: "Etapa 8.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "Los fantasmas se mueven con tu aceleración. La tecla que brilla te guía.",
    pista: "Fuerza neta entre masa total.",
    solo: "Ahora también la tensión: aísla un bloque y aplica ΣF = m·a.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const textoCorto = (p: ProblemaSistema) => `${p.tipo === "atwood" ? "Atwood" : "mesa"} · ${p.m1} y ${p.m2} kg`;

function cuenta(p: ProblemaSistema): string {
  const { a, T } = p.sistema;
  if (p.pregunta === "T") return p.tipo === "atwood" ? `T = 2·m₁·m₂·g/(m₁ + m₂) = 2·${p.m1}·${p.m2}·10/${p.m1 + p.m2} = ${fmtNum(T)} N` : `a = ${fmtNum(a)} m/s²; T = m₂(g − a) = ${p.m2}·(10 − ${fmtNum(a)}) = ${fmtNum(T)} N`;
  if (p.tipo === "atwood") return `a = (${p.m1} − ${p.m2})·10/(${p.m1} + ${p.m2}) = ${fmtNum(a)} m/s²`;
  // si no se mueve, la cuenta con signo daría negativa: mejor comparar las dos fuerzas
  if (a === 0) return `m₂g = ${p.m2 * 10} N no vence al rozamiento μm₁g = ${fmtNum(p.mu * p.m1 * 10)} N`;
  return p.mu > 0 ? `a = (${p.m2}·10 − ${fmtNum(p.mu)}·${p.m1}·10)/(${p.m1} + ${p.m2}) = ${fmtNum(a)} m/s²` : `a = ${p.m2}·10/(${p.m1} + ${p.m2}) = ${fmtNum(a)} m/s²`;
}

export default function EtapaSistemas() {
  const motor = useEtapa<ProblemaSistema>({ clave: "n8-sistemas", rondas: RONDAS_SISTEMAS, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.pregunta === "a" ? 1 : p.min;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const unidad = p.pregunta === "a" ? "m/s²" : "N";
  const teclas: Record<string, DecoTecla> = {
    "↑": { sub: `+${p.paso} ${unidad}` },
    "↓": { sub: `−${p.paso} ${unidad}` },
    intro: { sub: "¡suelta!" },
    h: { sub: "pista" },
  };

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(p.min, Math.min(p.max, v + d)) });
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
      const texto = p.pregunta === "T" ? `¡El dinamómetro marca ${p.respuesta} N! ${cuenta(p)}.` : p.respuesta === 0 ? `¡Bien! ${cuenta(p)}: el sistema no se mueve.` : `¡Los fantasmas van con el sistema! ${cuenta(p)}.`;
      setFb({ clave, tipo: "ok", texto });
    } else {
      motor.error();
      const texto = p.pregunta === "T" ? `El dinamómetro marca ${v < p.respuesta ? "más" : "menos"} de ${v} N.` : `Los fantasmas ${v > p.respuesta ? "se adelantaron" : "se quedaron atrás"}: la aceleración real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m/s².`;
      setFb({ clave, tipo: "mal", texto });
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
      cambiar(p.paso);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-p.paso);
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_DINAMICA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaSistema
            tipo={p.tipo}
            m1={p.m1}
            m2={p.m2}
            mu={p.mu}
            aReal={p.sistema.a}
            aFantasma={p.pregunta === "a" ? v : null}
            tension={p.pregunta === "T" && exito ? p.sistema.T : null}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaSistema tipo={it.tipo} m1={it.m1} m2={it.m2} mu={it.mu} aReal={it.sistema.a} aFantasma={null} tension={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        {p.tipo === "atwood" ? (
          <>
            Dos bloques de <b>{p.m1} kg</b> y <b>{p.m2} kg</b> cuelgan de una polea ideal (máquina de Atwood).
          </>
        ) : (
          <>
            Un bloque de <b>{p.m1} kg</b> está sobre una mesa {p.mu > 0 ? <>con rozamiento (μ = {fmtNum(p.mu)})</> : "lisa"} y una cuerda lo une a un bloque de <b>{p.m2} kg</b> que cuelga por el borde.
          </>
        )}{" "}
        {p.pregunta === "a" ? "¿Con qué aceleración se mueve el sistema?" : "¿Cuál es la tensión de la cuerda?"}
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <span>
            <V>m</V>
            <sub>1</sub>
          </span>{" "}
          <b>{p.m1} kg</b>
        </span>
        <span className="var-chip">
          <span>
            <V>m</V>
            <sub>2</sub>
          </span>{" "}
          <b>{p.m2} kg</b>
        </span>
        {p.mu > 0 && (
          <span className="var-chip">
            <V>μ</V> <b>{fmtNum(p.mu)}</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.tipo === "atwood" ? F_ATWOOD : F_MESA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-p.paso)} disabled={!motor.jugando}>
            − {p.pregunta}
          </button>
          <button className="btn" onClick={() => cambiar(p.paso)} disabled={!motor.jugando}>
            + {p.pregunta}
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
          simbolo={p.pregunta}
          valor={String(v)}
          unidad={unidad}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(p.paso)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-p.paso)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclas} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PLANO, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta {p.pregunta === "a" ? "la aceleración" : "la tensión"} · Enter para soltar</span>}
    />
  );
}
