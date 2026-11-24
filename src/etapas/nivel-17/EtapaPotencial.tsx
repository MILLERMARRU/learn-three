// ══ Etapa 17.3 · Potencial eléctrico y trabajo: el medidor debe llegar a la marca propuesta ───────
import { useState } from "react";
import { fmtQ } from "@/contenido/nivel-17/modelo";
import { F_POTENCIAL, RONDAS_POTENCIAL, V_MAX, V_MIN, type ProblemaPotencial } from "@/contenido/nivel-17/potencial";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPotencial } from "@/three/electro/EscenaPotencial";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ELECTRO, ESCENARIO_POTENCIAL, simularTecla, teclasElectro, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "17.3",
  titulo: "Potencial eléctrico",
  nivel: "Electrostática",
  nivelNum: 17,
  intro: (
    <>
      El <b>potencial eléctrico</b> es la energía por coulomb en cada punto: para una carga puntual, <b>V = k·Q/d</b>, con el signo de Q. Los puntos con el mismo potencial forman <b>superficies equipotenciales</b> (los anillos). Al llevar una carga q de A a B, el campo hace un trabajo <b>W = q·(V<sub>A</sub> − V<sub>B</sub>)</b>. Propón el valor: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mueve la carga! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Potencial de una carga positiva, en kV. La tecla que brilla te guía.",
    pista: "Cargas negativas: el potencial es negativo.",
    solo: "Trabajo del campo: W = q·(V(A) − V(B)), en mJ.",
  },
};

const dm = (d: number) => String(d).replace(".", ",");
const unidad = (p: ProblemaPotencial) => (p.tipo === "V" ? "kV" : "mJ");
const textoCorto = (p: ProblemaPotencial) => (p.tipo === "V" ? `potencial · ${fmtQ(p.Q)}` : "trabajo de A a B");
const conSigno = (n: number) => (n < 0 ? `(${String(n).replace("-", "−").replace(".", ",")})` : String(n).replace(".", ","));

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaPotencial): string {
  if (p.tipo === "V") return `V = 9×10⁹ · ${conSigno(p.Q)}×10⁻⁶ / ${dm(p.dA)} = ${String(p.respuesta).replace("-", "−")} kV`;
  return `W = ${conSigno(p.q ?? 0)} · (${String(p.VA).replace("-", "−")} − ${conSigno(p.VB ?? 0)}) = ${String(p.respuesta).replace("-", "−")} mJ`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPotencial() {
  const motor = useEtapa<ProblemaPotencial>({ clave: "n17-potencial", rondas: RONDAS_POTENCIAL, avanceMs: 1900 });
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
  const un = unidad(p);

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const mover = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El medidor llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      const signo = v !== 0 && Math.sign(v) !== Math.sign(p.respuesta) ? " Revisa el signo." : "";
      setFb({ clave, tipo: "mal", texto: `El medidor no llegó a tu marca: el valor es ${v > p.respuesta ? "menor" : "mayor"} que ${String(v).replace("-", "−")} ${un}.${signo}` });
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
    } else if (e.key === "Enter") mover();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textos = (q: ProblemaPotencial) => ({ textoQ: `Q = ${fmtQ(q.Q)}`, textoA: q.tipo === "V" ? `P · ${dm(q.dA)} m` : `A · ${dm(q.dA)} m`, textoB: q.dB === null ? "" : `B · ${dm(q.dB)} m` });

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ELECTRO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPotencial Q={p.Q} dA={p.dA} dB={p.dB} valor={p.respuesta} propuesta={v} unidad={un} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPotencial Q={it.Q} dA={it.dA} dB={it.dB} valor={it.respuesta} propuesta={null} unidad={unidad(it)} textoQ="" textoA="" textoB="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.tipo === "V" ? (
      <>
        ¿Cuál es el potencial eléctrico a <b>{dm(p.dA)} m</b> de una carga de <b>{fmtQ(p.Q)}</b> (en kV)?
      </>
    ) : (
      <>
        En el campo de una carga de <b>{fmtQ(p.Q)}</b>, una carga de prueba de <b>{fmtQ(p.q ?? 0)}</b> va de A (a <b>{dm(p.dA)} m</b>) a B (a <b>{dm(p.dB ?? 0)} m</b>). ¿Cuánto trabajo hace el campo (en mJ)?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>Q</V> <b>{fmtQ(p.Q)}</b>
        </span>
        {p.tipo === "V" ? (
          <span className="var-chip">
            <V>d</V> <b>{dm(p.dA)} m</b>
          </span>
        ) : (
          <>
            <span className="var-chip">
              <V>q</V> <b>{fmtQ(p.q ?? 0)}</b>
            </span>
            <span className="var-chip">
              <V>d</V> <b>
                {dm(p.dA)} → {dm(p.dB ?? 0)} m
              </b>
            </span>
          </>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_POTENCIAL}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={mover} disabled={!motor.jugando || corriendo}>
            ¡Mueve!
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
          simbolo={p.tipo === "V" ? "V" : "W"}
          valor={String(v).replace("-", "−")}
          unidad={un}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasElectro("¡mueve!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_POTENCIAL, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para mover la carga de prueba</span>}
    />
  );
}
