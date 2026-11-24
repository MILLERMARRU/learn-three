// ══ Etapa 17.1 · Ley de Coulomb: la flecha de la fuerza debe crecer hasta la fantasma propuesta ───────
import { useState } from "react";
import { F_COULOMB, F_MAX, F_MIN, fmtQ, RONDAS_COULOMB, type ProblemaCoulomb } from "@/contenido/nivel-17/coulomb";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCoulomb } from "@/three/electro/EscenaCoulomb";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ELECTRO, ESCENARIO_COULOMB, simularTecla, teclasElectro, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "17.1",
  titulo: "Ley de Coulomb",
  nivel: "Electrostática",
  nivelNum: 17,
  intro: (
    <>
      Dos cargas se ejercen fuerzas <b>iguales y opuestas</b>: se repelen si tienen el mismo signo y se atraen si tienen signos contrarios. Su valor es <b>F = k·q₁·q₂/d²</b>, con k = 9 × 10⁹ N·m²/C²: crece con las cargas y cae con el cuadrado de la distancia. Propón la fuerza: la flecha debe crecer hasta tu fantasma azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 N" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡carga! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "A 30 cm: F = 9×10⁹·q₁q₂/0,09. La tecla que brilla te guía.",
    pista: "Otras distancias: la fuerza cae con d².",
    solo: "Cargas con signo: ¿se atraen o se repelen?",
  },
};

const textoCorto = (p: ProblemaCoulomb) => `${fmtQ(p.q1)} y ${fmtQ(p.q2)} · ${p.d} cm`;

/** La cuenta: «F = 9×10⁹·2×10⁻⁶·5×10⁻⁶/0,3² = 1 N». */
function cuenta(p: ProblemaCoulomb): string {
  const dm = String(p.d / 100).replace(".", ",");
  return `F = 9×10⁹ · ${Math.abs(p.q1 * p.q2)}×10⁻¹² / ${dm}² = ${p.respuesta} N`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCoulomb() {
  const motor = useEtapa<ProblemaCoulomb>({ clave: "n17-coulomb", rondas: RONDAS_COULOMB, avanceMs: 1900 });
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
  const atraen = p.q1 * p.q2 < 0;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const cargar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡La flecha llegó a tu fantasma! ${cuenta(p)} (${atraen ? "se atraen" : "se repelen"}).` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `La flecha se quedó corta: la fuerza es menor que ${v} N.` : `La flecha pasó tu fantasma: la fuerza es mayor que ${v} N.` });
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
    } else if (e.key === "Enter") cargar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ELECTRO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCoulomb q1={p.q1} q2={p.q2} d={p.d} F={p.respuesta} Fpropuesta={v} textoQ1={`q₁ = ${fmtQ(p.q1)}`} textoQ2={`q₂ = ${fmtQ(p.q2)}`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCoulomb q1={it.q1} q2={it.q2} d={it.d} F={it.respuesta} Fpropuesta={null} textoQ1="" textoQ2="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      Dos cargas puntuales de <b>{fmtQ(p.q1)}</b> y <b>{fmtQ(p.q2)}</b> están separadas <b>{p.d} cm</b>. ¿Con qué fuerza interactúan?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>q₁</V> <b>{fmtQ(p.q1)}</b>
        </span>
        <span className="var-chip">
          <V>q₂</V> <b>{fmtQ(p.q2)}</b>
        </span>
        <span className="var-chip">
          <V>d</V> <b>{p.d} cm</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_COULOMB}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={cargar} disabled={!motor.jugando || corriendo}>
            ¡Carga!
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
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la fuerza">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la fuerza">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasElectro("¡carga!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_COULOMB, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 N · ← → de 10 · Enter para cargar las esferas</span>}
    />
  );
}
