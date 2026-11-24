// ══ Etapa 19.2 · Asociación de condensadores: el medidor de capacidad debe llegar a la marca propuesta ───────
import { useState } from "react";
import { C_ESCALA, F_PARALELO_C, F_SERIE_C, RONDAS_ASOCIACION, type ProblemaAsociacion } from "@/contenido/nivel-19/asociacion";
import { Q_MIN } from "@/contenido/nivel-19/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRed } from "@/three/circuitos/EscenaRed";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CONDENSADORES, ESCENARIO_ASOCIACION, simularTecla, teclasCondensador, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "19.2",
  titulo: "Asociación de condensadores",
  nivel: "Condensadores",
  nivelNum: 19,
  siguiente: { ruta: "/nivel/19/energia", titulo: "Etapa 19.3 · Energía almacenada" },
  intro: (
    <>
      Con los condensadores las reglas van <b>al revés que con las resistencias</b>. En <b>paralelo</b> es como juntar sus placas: las capacidades se suman, C = C₁ + C₂. En <b>serie</b> se suman los inversos, 1/C = 1/C₁ + 1/C₂, y la equivalente es menor que la menor. Propón la capacidad entre A y B: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 μF" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mide! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "En paralelo: se suman. La tecla que brilla te guía.",
    pista: "En serie: producto entre suma (con dos).",
    solo: "Mixtas: primero el paralelo.",
  },
};

const textoCorto = (p: ProblemaAsociacion) => ({ serie: "en serie", paralelo: "en paralelo", mixta: "mixta" })[p.tipo];

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaAsociacion): string {
  if (p.tipo === "paralelo") return `C = ${p.cs.join(" + ")} = ${p.respuesta} μF`;
  if (p.tipo === "serie") return p.cs.length === 2 ? `C = ${p.cs[0]}·${p.cs[1]} / (${p.cs[0]} + ${p.cs[1]}) = ${p.respuesta} μF` : `C = ${p.cs[0]} / ${p.cs.length} = ${p.respuesta} μF`;
  const par = p.cs[1] + p.cs[2];
  return `${p.cs[1]} + ${p.cs[2]} = ${par} μF → C = ${p.cs[0]}·${par} / (${p.cs[0]} + ${par}) = ${p.respuesta} μF`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaAsociacion() {
  const motor = useEtapa<ProblemaAsociacion>({ clave: "n19-asociacion", rondas: RONDAS_ASOCIACION, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(Q_MIN, Math.min(C_ESCALA, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡El medidor llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      const menor = p.tipo === "serie" && v >= Math.min(...p.cs) ? " En serie, la equivalente es menor que el menor." : "";
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la capacidad es ${v > p.respuesta ? "menor" : "mayor"} que ${v} μF.${menor}` });
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
  const comunes = { componente: "condensador" as const, unidad: "μF", simbolo: "C", textoMedidor: "capacímetro", escala: C_ESCALA };

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CONDENSADORES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRed tipo={p.tipo} rs={p.cs} R={p.respuesta} propuesta={v} {...comunes} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaRed tipo={it.tipo} rs={it.cs} R={it.respuesta} propuesta={null} {...comunes} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const lista = p.cs.map((c) => `${c} μF`).join(", ");
  const enunciado =
    p.tipo === "mixta" ? (
      <>
        Un condensador de <b>{p.cs[0]} μF</b> está en serie con un paralelo de <b>{p.cs[1]} μF</b> y <b>{p.cs[2]} μF</b>. ¿Cuál es la capacidad equivalente entre A y B?
      </>
    ) : (
      <>
        Los condensadores <b>{lista}</b> están en <b>{p.tipo}</b>. ¿Cuál es la capacidad equivalente entre A y B?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.cs.map((c, i) => (
          <span key={i} className="var-chip">
            C{"₁₂₃"[i]} <b>{c} μF</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.tipo === "paralelo" ? F_PARALELO_C : F_SERIE_C}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="C"
          valor={String(v)}
          unidad="μF"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la capacidad">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la capacidad">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCondensador("¡mide!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ASOCIACION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 μF · ← → de 10 · Enter para medir la capacidad</span>}
    />
  );
}
