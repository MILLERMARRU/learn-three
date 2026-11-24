// ══ Etapa 20.2 · Campo de un conductor recto: la brújula gira y el teslámetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { B_ESCALA, F_CAMPO_RECTO, RONDAS_CAMPO_RECTO, type ProblemaCampoRecto } from "@/contenido/nivel-20/campoRecto";
import { F_MIN } from "@/contenido/nivel-20/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCampoRecto } from "@/three/magnetismo/EscenaCampoRecto";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_MAGNETISMO, ESCENARIO_CAMPO_RECTO, simularTecla, teclasMagnetismo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "20.2",
  titulo: "Campo de un conductor recto",
  nivel: "Electromagnetismo",
  nivelNum: 20,
  siguiente: { ruta: "/nivel/20/induccion", titulo: "Etapa 20.3 · Inducción electromagnética" },
  intro: (
    <>
      Una corriente crea un <b>campo magnético</b> a su alrededor (lo descubrió Ørsted al ver girar una brújula). Para un cable recto largo, el campo forma círculos y vale <b>B = μ₀·I/(2π·d) = 2 × 10⁻⁷·I/d</b>; su sentido lo da la regla de la mano derecha. Con dos cables, los campos se suman o se restan. Propón B en P (en μT): el teslámetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 μT" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡enciende! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "B (μT) = 0,2·I/d con d en metros. La tecla que brilla te guía.",
    pista: "Distancias en cm: pásalas a metros.",
    solo: "Dos cables: opuestas se suman, iguales se restan.",
  },
};

const simbolo = (s: 1 | -1) => (s > 0 ? "⊙" : "⊗");
const textoCorto = (p: ProblemaCampoRecto) => (p.cables.length === 1 ? `${p.cables[0].I} A · ${p.d} cm` : "dos cables");

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaCampoRecto): string {
  const dm = String(p.d / 100).replace(".", ",");
  if (p.cables.length === 1) return `B = 0,2 · ${p.cables[0].I} / ${dm} = ${p.respuesta} μT`;
  const [a, b] = p.componentes.map((x) => Math.abs(x));
  const suma = Math.sign(p.componentes[0]) === Math.sign(p.componentes[1]);
  return `B₁ = ${a} y B₂ = ${b} → B = ${suma ? `${a} + ${b}` : `${Math.max(a, b)} − ${Math.min(a, b)}`} = ${p.respuesta} μT`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCampoRecto() {
  const motor = useEtapa<ProblemaCampoRecto>({ clave: "n20-campo-recto", rondas: RONDAS_CAMPO_RECTO, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(F_MIN, Math.min(B_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const encender = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El teslámetro llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: el campo es ${v > p.respuesta ? "menor" : "mayor"} que ${v} μT.` });
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
    } else if (e.key === "Enter") encender();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textos = (q: ProblemaCampoRecto) => q.cables.map((c, i) => `${q.cables.length === 2 ? `I${i === 0 ? "₁" : "₂"}` : "I"} = ${c.I} A ${simbolo(c.sentido)}`);

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MAGNETISMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCampoRecto cables={p.cables} d={p.d} B={p.respuesta} sentidoB={p.sentidoB} propuesta={v} escala={B_ESCALA} textos={textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCampoRecto cables={it.cables} d={it.d} B={it.respuesta} sentidoB={it.sentidoB} propuesta={null} escala={B_ESCALA} textos={[]} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.cables.length === 1 ? (
      <>
        Un cable recto largo lleva <b>{p.cables[0].I} A</b>. ¿Qué campo magnético crea a <b>{p.d} cm</b> de él (en μT)?
      </>
    ) : (
      <>
        Dos cables paralelos llevan <b>{p.cables[0].I} A</b> y <b>{p.cables[1].I} A</b> en sentidos <b>{p.cables[0].sentido === p.cables[1].sentido ? "iguales" : "opuestos"}</b>. ¿Qué campo hay en el punto medio, a <b>{p.d} cm</b> de cada uno?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {textos(p).map((t, i) => (
          <span key={i} className="var-chip">
            <b>{t}</b>
          </span>
        ))}
        <span className="var-chip">
          <b>d = {p.d} cm</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CAMPO_RECTO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={encender} disabled={!motor.jugando || corriendo}>
            ¡Enciende!
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
          simbolo="B"
          valor={String(v)}
          unidad="μT"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el campo">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el campo">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasMagnetismo("¡enciende!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CAMPO_RECTO, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 μT · ← → de 10 · Enter para encender la corriente</span>}
    />
  );
}
