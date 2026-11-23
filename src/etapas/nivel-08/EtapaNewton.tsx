// ══ Etapa 8.1 · Segunda ley de Newton: ajusta la fuerza para que el bloque llegue a la bandera justo a tiempo ───────
import { useState } from "react";
import { F_MAX, F_MIN, F_NEWTON, F_PASO, RONDAS_NEWTON, type ProblemaNewton } from "@/contenido/nivel-08/newton";
import { aceleracionEnPiso, G } from "@/lib/dinamica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaBloque } from "@/three/dinamica/EscenaBloque";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_DINAMICA, ESCENARIO_DINAMICA, fmtNum, simularTecla, TECLAS_FUERZA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "8.1",
  titulo: "Segunda ley de Newton",
  nivel: "Dinámica",
  nivelNum: 8,
  intro: (
    <>
      Una fuerza neta acelera al cuerpo: <b>ΣF = m·a</b>. Si el bloque parte del reposo, recorre d = ½·a·t², así que para llegar a la bandera en t segundos necesita <b>a = 2d/t²</b>. Calcula la fuerza, empuja y mira si llega justo a tiempo. Con rozamiento, parte de la fuerza se gasta en vencerlo.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la fuerza (5 N)" },
    { teclas: ["⏎"], texto: "¡empuja! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Primero la aceleración, luego F = m·a. La tecla que brilla te guía.",
    pista: "Piso liso: toda la fuerza acelera al bloque.",
    solo: "Hay rozamiento: F = m·a + μ·m·g.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const textoCorto = (p: ProblemaNewton) => `${p.m} kg · ${p.d} m en ${p.t} s${p.mu > 0 ? ` · μ = ${fmtNum(p.mu, 2)}` : ""}`;

export default function EtapaNewton() {
  const motor = useEtapa<ProblemaNewton>({ clave: "n8-newton", rondas: RONDAS_NEWTON, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: F_MIN });
  const v = st.clave === clave ? st.v : F_MIN;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const f = p.mu * p.m * G;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const empujar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = ({ x }: { x: number }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    const a = aceleracionEnPiso(v, p.m, p.mu);
    const cuenta = p.mu > 0 ? `a = (F − f)/m = (${v} − ${fmtNum(f)})/${p.m} = ${fmtNum(a, 2)} m/s²` : `a = F/m = ${v}/${p.m} = ${fmtNum(a, 2)} m/s²`;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Justo a tiempo, en ${p.t} s! ${cuenta}; x = ½·a·t² = ${p.d} m.` });
    } else {
      motor.error();
      const nada = a === 0 ? " La fuerza no vence al rozamiento: ni se movió." : "";
      setFb({ clave, tipo: "mal", texto: `En ${p.t} s recorrió ${fmtNum(x)} m de ${p.d}. ${cuenta}.${nada} ${v < p.respuesta ? "Le faltó: más fuerza." : "Se pasó: menos fuerza."}` });
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
      cambiar(F_PASO);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-F_PASO);
    } else if (e.key === "Enter") empujar();
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
          <EscenaBloque m={p.m} d={p.d} t={p.t} mu={p.mu} F={v} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaBloque m={it.m} d={it.d} t={it.t} mu={it.mu} F={it.respuesta} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        Un bloque de <b>{p.m} kg</b> está en reposo sobre un piso {p.mu > 0 ? <>con rozamiento (μ = {fmtNum(p.mu, 2)})</> : "liso"}. ¿Con qué fuerza horizontal hay que empujarlo para que recorra <b>{p.d} m</b> en <b>{p.t} s</b>?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{p.m} kg</b>
        </span>
        <span className="var-chip">
          <V>d</V> <b>{p.d} m</b>
        </span>
        <span className="var-chip">
          <V>t</V> <b>{p.t} s</b>
        </span>
        {p.mu > 0 && (
          <span className="var-chip">
            <V>μ</V> <b>{fmtNum(p.mu, 2)}</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_NEWTON}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-F_PASO)} disabled={!motor.jugando}>
            − F
          </button>
          <button className="btn" onClick={() => cambiar(F_PASO)} disabled={!motor.jugando}>
            + F
          </button>
          <button className="btn btn-pri" onClick={empujar} disabled={!motor.jugando || corriendo}>
            ¡Empuja!
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
              <button className="slot-arr" onClick={() => cambiar(F_PASO)} aria-label="Subir la fuerza">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-F_PASO)} aria-label="Bajar la fuerza">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_FUERZA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_DINAMICA, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la fuerza · Enter para empujar</span>}
    />
  );
}
