// ══ Etapa 15.2 · Calor sensible: la columna del termómetro debe detenerse en la temperatura propuesta ───────
import { useState } from "react";
import { F_CALENTADOR, RONDAS_CALENTADOR, SUSTANCIAS, T_MAX, T_MIN, type ProblemaCalentador } from "@/contenido/nivel-15/calentador";
import { fmtC } from "@/contenido/nivel-15/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCalentador } from "@/three/calor/EscenaCalentador";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CALOR, ESCENARIO_CALENTADOR, simularTecla, teclasCalor, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "15.2",
  titulo: "Calor sensible",
  nivel: "Calor",
  nivelNum: 15,
  siguiente: { ruta: "/nivel/15/mezcla", titulo: "Etapa 15.3 · Equilibrio térmico" },
  intro: (
    <>
      El calor es energía que pasa de un cuerpo caliente a uno frío. Si no cambia de estado, sube su temperatura: <b>Q = m·c·ΔT</b>, donde c es el <b>calor específico</b> (para el agua, 1 cal/g·°C). Cuanto menor es c, más se calienta con el mismo calor. Propón la temperatura final: la columna del termómetro debe detenerse en tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 °C" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡enciende! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Agua: ΔT = Q/m. La tecla que brilla te guía.",
    pista: "Otras sustancias: usa su calor específico.",
    solo: "Datos en kg y kcal: pásalos a g y cal.",
  },
};

const sust = (p: ProblemaCalentador) => SUSTANCIAS[p.sustancia];
const masaTxt = (p: ProblemaCalentador) => (p.enKilo ? `${fmtC(p.m / 1000)} kg` : `${p.m} g`);
const qTxt = (p: ProblemaCalentador) => (p.enKilo ? `${fmtC(p.Q / 1000)} kcal` : `${String(p.Q).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} cal`);
const textoCorto = (p: ProblemaCalentador) => `${sust(p).nombre} · ${masaTxt(p)}`;

/** La cuenta: «ΔT = 6000/(200·1) = 30 °C → T = 50 °C». */
function cuenta(p: ProblemaCalentador): string {
  const dT = p.respuesta - p.T0;
  return `ΔT = ${p.Q}/(${p.m}·${fmtC(sust(p).c)}) = ${dT} °C → T = ${p.T0} + ${dT} = ${p.respuesta} °C`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCalentador() {
  const motor = useEtapa<ProblemaCalentador>({ clave: "n15-calentador", rondas: RONDAS_CALENTADOR, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.T0;
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
      setFb({ clave, tipo: "ok", texto: `¡La columna se detuvo en tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `La columna se detuvo antes de tu marca: ${v} °C es demasiado.` : `La columna pasó tu marca: llega a más de ${v} °C.` });
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
  const s = sust(p);

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CALOR}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCalentador color={s.color} liquida={s.liquida} T0={p.T0} T={p.respuesta} Tpropuesta={v} textoSustancia={`${s.nombre} · ${masaTxt(p)}`} textoQ={`Q = ${qTxt(p)}`} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCalentador color={sust(it).color} liquida={sust(it).liquida} T0={it.T0} T={it.respuesta} Tpropuesta={null} textoSustancia="" textoQ="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = (
    <>
      {s.liquida ? "Un recipiente con" : "Un bloque de"} <b>{masaTxt(p)}</b> de <b>{s.nombre}</b> a <b>{p.T0} °C</b> recibe <b>{qTxt(p)}</b>. ¿A qué temperatura llega?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{masaTxt(p)}</b>
        </span>
        <span className="var-chip">
          <V>c</V> <b>{fmtC(s.c)} cal/g·°C</b>
        </span>
        <span className="var-chip">
          <V>Q</V> <b>{qTxt(p)}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CALENTADOR}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="T"
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
      teclado={<TecladoVirtual activas={teclasCalor("¡enciende!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CALENTADOR, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 °C · ← → de 10 · Enter para encender la placa</span>}
    />
  );
}
