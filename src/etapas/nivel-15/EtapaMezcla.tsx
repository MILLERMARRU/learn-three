// ══ Etapa 15.3 · Equilibrio térmico: tras mezclar, el termómetro debe detenerse en la temperatura propuesta ───────
import { useState } from "react";
import { F_MEZCLA, RONDAS_MEZCLA, SUSTANCIAS, T_MAX, T_MIN, type CuerpoMezcla, type ProblemaMezcla } from "@/contenido/nivel-15/mezcla";
import { fmtC } from "@/contenido/nivel-15/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaMezcla } from "@/three/calor/EscenaMezcla";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CALOR, ESCENARIO_MEZCLA, simularTecla, teclasCalor, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "15.3",
  titulo: "Equilibrio térmico",
  nivel: "Calor",
  nivelNum: 15,
  intro: (
    <>
      Al juntar dos cuerpos a distinta temperatura, el caliente cede calor y el frío lo gana hasta que ambos quedan a la misma <b>temperatura de equilibrio</b>. En un calorímetro no se pierde calor: <b>calor ganado = calor perdido</b>, así que Tₑ es un promedio de las temperaturas pesado por m·c. Propón Tₑ: el termómetro debe detenerse en tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 °C" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mezcla! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/15/examen", titulo: "Etapa 15.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "Agua con agua: promedio pesado por las masas. La tecla que brilla te guía.",
    pista: "Masas muy distintas y aceite con agua (pesa m·c).",
    solo: "Un metal caliente se sumerge en agua.",
  },
};

const sust = (k: CuerpoMezcla) => SUSTANCIAS[k.sustancia];
const texto = (k: CuerpoMezcla) => `${sust(k).nombre} · ${k.m} g · ${fmtC(k.T)} °C`;
const textoCorto = (p: ProblemaMezcla) => `${sust(p.a).nombre} en ${sust(p.b).nombre}`;
const mc = (k: CuerpoMezcla) => Math.round(k.m * sust(k).c * 1e6) / 1e6;

/** La cuenta: «Tₑ = (100·80 + 100·20)/200 = 50 °C» (con m·c si hay sustancias distintas). */
function cuenta(p: ProblemaMezcla): string {
  const mismaC = sust(p.a).c === sust(p.b).c;
  if (mismaC) return `Tₑ = (${p.a.m}·${p.a.T} + ${p.b.m}·${p.b.T})/${p.a.m + p.b.m} = ${p.respuesta} °C`;
  return `Tₑ = (${fmtC(mc(p.a))}·${p.a.T} + ${fmtC(mc(p.b))}·${p.b.T})/${fmtC(mc(p.a) + mc(p.b))} = ${p.respuesta} °C`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaMezcla() {
  const motor = useEtapa<ProblemaMezcla>({ clave: "n15-mezcla", rondas: RONDAS_MEZCLA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.b.T;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(T_MIN, Math.min(T_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const mezclar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El termómetro se detuvo en tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `El termómetro se detuvo antes de tu marca: el equilibrio está por debajo de ${v} °C.` : `El termómetro pasó tu marca: el equilibrio está por encima de ${v} °C.` });
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
    } else if (e.key === "Enter") mezclar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const fraccion = (q: ProblemaMezcla) => q.a.m / (q.a.m + q.b.m);
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CALOR}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaMezcla
            colorA={sust(p.a).color}
            liquidoA={sust(p.a).liquida}
            fraccionA={fraccion(p)}
            colorB={sust(p.b).color}
            Tb={p.b.T}
            Te={p.respuesta}
            Tpropuesta={v}
            textoA={texto(p.a)}
            textoB={texto(p.b)}
            verValor={exito}
            corrida={enCurso ? { id: enCurso.id } : null}
            moviendo={corriendo}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaMezcla colorA={sust(it.a).color} liquidoA={sust(it.a).liquida} fraccionA={fraccion(it)} colorB={sust(it.b).color} Tb={it.b.T} Te={it.respuesta} Tpropuesta={null} textoA="" textoB="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const a = p.a;
  const b = p.b;
  const enunciado = sust(a).liquida ? (
    <>
      En un calorímetro con <b>{b.m} g</b> de {sust(b).nombre} a <b>{b.T} °C</b> se vierten <b>{a.m} g</b> de {sust(a).nombre} a <b>{a.T} °C</b>. ¿Cuál es la temperatura de equilibrio?
    </>
  ) : (
    <>
      Un bloque de <b>{sust(a).nombre}</b> de <b>{a.m} g</b> a <b>{a.T} °C</b> se sumerge en <b>{b.m} g</b> de agua a <b>{b.T} °C</b>. ¿Cuál es la temperatura de equilibrio?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>c</V>
          <Sub>1</Sub> <b>{fmtC(sust(a).c)}</b>
        </span>
        <span className="var-chip">
          <V>c</V>
          <Sub>2</Sub> <b>{fmtC(sust(b).c)}</b>
        </span>
        <span className="var-chip">cal/g·°C</span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="m">{F_MEZCLA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={mezclar} disabled={!motor.jugando || corriendo}>
            ¡Mezcla!
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
          simbolo="Tₑ"
          valor={String(v)}
          unidad="°C"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la temperatura">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la temperatura">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCalor("¡mezcla!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_MEZCLA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 °C · ← → de 10 · Enter para mezclar</span>}
    />
  );
}
