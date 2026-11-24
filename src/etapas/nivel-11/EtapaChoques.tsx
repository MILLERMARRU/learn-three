// ══ Etapa 11.3 · Choques elásticos e inelásticos: velocidad de un carrito tras el choque, con fantasma ───────
import { useState } from "react";
import { conSigno, V_MAX, V_MIN } from "@/contenido/nivel-11/impulso";
import { F_CHOQUE, RONDAS_CHOQUES, type ProblemaChoque } from "@/contenido/nivel-11/choques";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRiel } from "@/three/momento/EscenaRiel";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_MOMENTO, ESCENARIO_RIEL, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "11.3",
  titulo: "Choques elásticos e inelásticos",
  nivel: "Cantidad de movimiento y choques",
  nivelNum: 11,
  intro: (
    <>
      En todo choque se conserva la cantidad de movimiento. Para saber cómo salen, falta una ecuación: el <b>coeficiente de restitución</b> e compara la rapidez con que se separan con la rapidez con que se acercaban. <b>e = 1</b>: choque elástico; <b>e = 0</b>: quedan pegados. Predice la velocidad del carrito pedido: su <b>fantasma</b> saldrá del choque con ella.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la velocidad (1 m/s; negativa = hacia la izquierda)" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Elásticos: velocidad del carrito golpeado. La tecla que brilla te guía.",
    pista: "Elásticos: ¿el que golpea rebota?",
    solo: "Choques con e < 1 y de frente.",
  },
};

const TECLAS_V: Record<string, DecoTecla> = {
  "↑": { sub: "+1 m/s" },
  "↓": { sub: "−1 m/s" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

const entre = (v: number) => (v < 0 ? `(${conSigno(v)})` : conSigno(v));

/** La cuenta con las dos ecuaciones y el resultado de ambos carritos. */
function cuenta(p: ProblemaChoque): string {
  const pTot = p.m1 * p.u1 + p.m2 * p.u2;
  return `p = ${p.m1}·${entre(p.u1)} + ${p.m2}·${entre(p.u2)} = ${conSigno(pTot)}; v₂′ − v₁′ = ${fmtNum(p.e, 2)}·${conSigno(p.u1 - p.u2)} → v₁′ = ${conSigno(p.w1)} m/s, v₂′ = ${conSigno(p.w2)} m/s`;
}

const textoCorto = (p: ProblemaChoque) => `${p.m1} kg vs ${p.m2} kg · e = ${fmtNum(p.e, 2)}`;
const comoVa = (v: number) => (v === 0 ? "en reposo" : v > 0 ? `que va a ${v} m/s hacia la derecha` : `que viene a ${-v} m/s hacia la izquierda`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaChoques() {
  const motor = useEtapa<ProblemaChoque>({ clave: "n11-choques", rondas: RONDAS_CHOQUES, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡Sale junto al fantasma! ${cuenta(p)}.` });
    } else {
      motor.error();
      const sentido = Math.sign(v) !== Math.sign(p.respuesta) ? "El fantasma salió hacia el otro lado" : `El fantasma ${Math.abs(v) > Math.abs(p.respuesta) ? "se adelantó" : "se quedó atrás"}`;
      setFb({ clave, tipo: "mal", texto: `${sentido}: la velocidad real es ${v > p.respuesta ? "menor" : "mayor"} que ${conSigno(v)} m/s.` });
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
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MOMENTO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRiel
            m1={p.m1}
            m2={p.m2}
            modo="choque"
            u1={p.u1}
            u2={p.u2}
            w1={p.w1}
            w2={p.w2}
            fantasmaDe={p.pedido}
            propuesta={v}
            rotulo={exito ? `v₁′ = ${conSigno(p.w1)} · v₂′ = ${conSigno(p.w2)} m/s` : null}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaRiel m1={it.m1} m2={it.m2} modo="choque" u1={it.u1} u2={it.u2} w1={it.w1} w2={it.w2} fantasmaDe={it.pedido} propuesta={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      Un carrito de <b>{p.m1} kg</b> que va a <b>{p.u1} m/s</b> hacia la derecha choca de frente con otro de <b>{p.m2} kg</b> {comoVa(p.u2)}. {p.e === 1 ? <>El choque es <b>elástico</b> (e = 1).</> : <>El coeficiente de restitución es <b>e = {fmtNum(p.e, 2)}</b>.</>} ¿Con qué velocidad sale el carrito {p.pedido === 1 ? "1 (el de la izquierda)" : "2 (el de la derecha)"}?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V>₁ <b>{p.m1} kg</b>
        </span>
        <span className="var-chip">
          <V>m</V>₂ <b>{p.m2} kg</b>
        </span>
        <span className="var-chip">
          <V>v</V>₁ <b>{conSigno(p.u1)}</b>
        </span>
        <span className="var-chip">
          <V>v</V>₂ <b>{conSigno(p.u2)}</b>
        </span>
        <span className="var-chip">
          <V>e</V> <b>{fmtNum(p.e, 2)}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CHOQUE}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − v
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + v
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
          simbolo={p.pedido === 1 ? "v₁′" : "v₂′"}
          valor={conSigno(v)}
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
      teclado={<TecladoVirtual activas={TECLAS_V} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_RIEL, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la velocidad · Enter para soltar</span>}
    />
  );
}
