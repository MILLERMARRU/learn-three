// ══ Etapa 18.3 · Potencia eléctrica: el foco brilla y el vatímetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { fmtE, O_MIN } from "@/contenido/nivel-18/modelo";
import { F_POTENCIA_E, P_ESCALA, RONDAS_POTENCIA_E, type ProblemaPotenciaE } from "@/contenido/nivel-18/potencia";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPotencia } from "@/three/circuitos/EscenaPotencia";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CIRCUITOS, ESCENARIO_POTENCIA, simularTecla, teclasCircuito, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "18.3",
  titulo: "Potencia eléctrica",
  nivel: "Electrodinámica",
  nivelNum: 18,
  intro: (
    <>
      La <b>potencia eléctrica</b> es la energía que entrega la corriente por segundo: <b>P = V·I</b> (en watts). Con la ley de Ohm también es <b>P = I²·R = V²/R</b>: en una resistencia esa energía se vuelve calor y luz (<b>efecto Joule</b>). Propón la potencia: el foco brillará según ella y el vatímetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 W" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡enciende! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/18/examen", titulo: "Etapa 18.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "P = V·I. La tecla que brilla te guía.",
    pista: "P = I²·R o P = V²/R.",
    solo: "Focos con otro voltaje: primero su resistencia.",
  },
};

const textoCorto = (p: ProblemaPotenciaE) => (p.dato === "nominal" ? `foco de ${p.a} W` : `P con ${p.dato[0]} y ${p.dato[1]}`);

/** Rótulos de la escena: solo los datos del enunciado. */
function textos(p: ProblemaPotenciaE) {
  if (p.dato === "nominal") return { textoFuente: `V = ${fmtE(p.c ?? 0)} V`, textoFoco: `foco ${p.a} W · ${p.b} V`, textoI: "I = ?" };
  if (p.dato === "VI") return { textoFuente: `V = ${fmtE(p.a)} V`, textoFoco: "foco", textoI: `I = ${fmtE(p.b)} A` };
  if (p.dato === "IR") return { textoFuente: "fuente", textoFoco: `R = ${fmtE(p.b)} Ω`, textoI: `I = ${fmtE(p.a)} A` };
  return { textoFuente: `V = ${fmtE(p.a)} V`, textoFoco: `R = ${fmtE(p.b)} Ω`, textoI: "I = ?" };
}

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaPotenciaE): string {
  if (p.dato === "VI") return `P = ${fmtE(p.a)} · ${fmtE(p.b)} = ${p.respuesta} W`;
  if (p.dato === "IR") return `P = ${fmtE(p.a)}² · ${fmtE(p.b)} = ${p.respuesta} W`;
  if (p.dato === "VR") return `P = ${fmtE(p.a)}² / ${fmtE(p.b)} = ${p.respuesta} W`;
  return `R = ${p.b}²/${p.a} = ${fmtE(p.R)} Ω → P = ${fmtE(p.c ?? 0)}²/${fmtE(p.R)} = ${p.respuesta} W`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPotenciaElectrica() {
  const motor = useEtapa<ProblemaPotenciaE>({ clave: "n18-potencia", rondas: RONDAS_POTENCIA_E, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(O_MIN, Math.min(P_ESCALA, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡El vatímetro llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la potencia es ${v > p.respuesta ? "menor" : "mayor"} que ${v} W.` });
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

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CIRCUITOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPotencia P={p.respuesta} propuesta={v} escala={P_ESCALA} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPotencia P={it.respuesta} propuesta={null} escala={P_ESCALA} textoFuente="" textoFoco="" textoI="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.dato === "VI" ? (
      <>
        Un foco conectado a <b>{fmtE(p.a)} V</b> deja pasar <b>{fmtE(p.b)} A</b>. ¿Qué potencia consume?
      </>
    ) : p.dato === "IR" ? (
      <>
        Por una resistencia de <b>{fmtE(p.b)} Ω</b> circulan <b>{fmtE(p.a)} A</b>. ¿Qué potencia disipa?
      </>
    ) : p.dato === "VR" ? (
      <>
        Una resistencia de <b>{fmtE(p.b)} Ω</b> se conecta a <b>{fmtE(p.a)} V</b>. ¿Qué potencia disipa?
      </>
    ) : (
      <>
        Un foco dice <b>«{p.a} W · {p.b} V»</b>. Si se conecta a <b>{fmtE(p.c ?? 0)} V</b>, ¿qué potencia consume?
      </>
    );

  const chips: [string, string][] =
    p.dato === "VI"
      ? [
          ["V", `${fmtE(p.a)} V`],
          ["I", `${fmtE(p.b)} A`],
        ]
      : p.dato === "IR"
        ? [
            ["I", `${fmtE(p.a)} A`],
            ["R", `${fmtE(p.b)} Ω`],
          ]
        : p.dato === "VR"
          ? [
              ["V", `${fmtE(p.a)} V`],
              ["R", `${fmtE(p.b)} Ω`],
            ]
          : [
              ["P nom", `${p.a} W`],
              ["V nom", `${p.b} V`],
              ["V", `${fmtE(p.c ?? 0)} V`],
            ];

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {chips.map(([s, val]) => (
          <span key={s} className="var-chip">
            <V>{s}</V> <b>{val}</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="m">{F_POTENCIA_E}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="P"
          valor={String(v)}
          unidad="W"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la potencia">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la potencia">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCircuito("¡enciende!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_POTENCIA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 W · ← → de 10 · Enter para encender el foco</span>}
    />
  );
}
