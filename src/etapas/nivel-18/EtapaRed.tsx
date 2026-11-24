// ══ Etapa 18.2 · Resistencias en serie y en paralelo: la aguja del óhmetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { O_MIN } from "@/contenido/nivel-18/modelo";
import { F_PARALELO, F_SERIE, RED_ESCALA, RONDAS_RED, type ProblemaRed } from "@/contenido/nivel-18/red";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRed } from "@/three/circuitos/EscenaRed";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CIRCUITOS, ESCENARIO_RED, simularTecla, teclasCircuito, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "18.2",
  titulo: "Resistencias en serie y en paralelo",
  nivel: "Electrodinámica",
  nivelNum: 18,
  siguiente: { ruta: "/nivel/18/potencia", titulo: "Etapa 18.3 · Potencia eléctrica" },
  intro: (
    <>
      Varias resistencias se pueden reemplazar por una sola, la <b>equivalente</b>. En <b>serie</b> (una tras otra) se suman: R = R₁ + R₂ + … En <b>paralelo</b> (lado a lado) la corriente se reparte y se suman los inversos: 1/R = 1/R₁ + 1/R₂; la equivalente es menor que la menor. Propón la resistencia entre A y B: el óhmetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 Ω" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mide! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "En serie: se suman. La tecla que brilla te guía.",
    pista: "En paralelo: producto entre suma (con dos).",
    solo: "Mixtas: reduce primero el paralelo.",
  },
};

const textoCorto = (p: ProblemaRed) => ({ serie: "en serie", paralelo: "en paralelo", mixta: "mixta" })[p.tipo];

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaRed): string {
  if (p.tipo === "serie") return `R = ${p.rs.join(" + ")} = ${p.respuesta} Ω`;
  if (p.tipo === "paralelo") return p.rs.length === 2 ? `R = ${p.rs[0]}·${p.rs[1]} / (${p.rs[0]} + ${p.rs[1]}) = ${p.respuesta} Ω` : `R = ${p.rs[0]} / ${p.rs.length} = ${p.respuesta} Ω`;
  const par = p.respuesta - p.rs[0];
  return `${p.rs[1]} ∥ ${p.rs[2]} = ${par} Ω → R = ${p.rs[0]} + ${par} = ${p.respuesta} Ω`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaRed() {
  const motor = useEtapa<ProblemaRed>({ clave: "n18-red", rondas: RONDAS_RED, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(O_MIN, Math.min(RED_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const medir = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡La aguja llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      const menor = p.tipo === "paralelo" && v >= Math.min(...p.rs) ? " En paralelo, la equivalente es menor que la menor." : "";
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la equivalente es ${v > p.respuesta ? "menor" : "mayor"} que ${v} Ω.${menor}` });
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
    } else if (e.key === "Enter") medir();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CIRCUITOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRed tipo={p.tipo} rs={p.rs} R={p.respuesta} propuesta={v} escala={RED_ESCALA} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaRed tipo={it.tipo} rs={it.rs} R={it.respuesta} propuesta={null} escala={RED_ESCALA} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const lista = p.rs.map((r) => `${r} Ω`).join(", ");
  const enunciado =
    p.tipo === "mixta" ? (
      <>
        Una resistencia de <b>{p.rs[0]} Ω</b> está en serie con un paralelo de <b>{p.rs[1]} Ω</b> y <b>{p.rs[2]} Ω</b>. ¿Cuál es la resistencia equivalente entre A y B?
      </>
    ) : (
      <>
        Las resistencias <b>{lista}</b> están en <b>{p.tipo}</b>. ¿Cuál es la resistencia equivalente entre A y B?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.rs.map((r, i) => (
          <span key={i} className="var-chip">
            R{"₁₂₃"[i]} <b>{r} Ω</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.tipo === "serie" ? F_SERIE : F_PARALELO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={medir} disabled={!motor.jugando || corriendo}>
            ¡Mide!
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
          simbolo="R"
          valor={String(v)}
          unidad="Ω"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la resistencia">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la resistencia">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCircuito("¡mide!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_RED, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 Ω · ← → de 10 · Enter para medir con el óhmetro</span>}
    />
  );
}
