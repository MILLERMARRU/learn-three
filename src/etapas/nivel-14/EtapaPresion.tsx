// ══ Etapa 14.1 · Presión hidrostática: el sensor baja y la aguja del manómetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_PRESION, fmtF, LIQUIDOS, P_MAX, P_MIN, RONDAS_PRESION, type ProblemaPresion } from "@/contenido/nivel-14/presion";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPresion } from "@/three/fluidos/EscenaPresion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_FLUIDOS, ESCENARIO_PRESION, simularTecla, TECLAS_FLUIDO, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "14.1",
  titulo: "Presión hidrostática",
  nivel: "Hidrostática",
  nivelNum: 14,
  siguiente: { ruta: "/nivel/14/prensa", titulo: "Etapa 14.2 · Principio de Pascal" },
  intro: (
    <>
      Dentro de un líquido, el peso del líquido de arriba empuja en todas direcciones: es la <b>presión hidrostática, P = ρ·g·h</b>. Crece con la profundidad y con la densidad del líquido, y no depende de la forma del recipiente. La presión <b>absoluta</b> le suma la del aire (100 kPa). Propón la presión: el sensor bajará y la aguja del manómetro debe llegar a tu marca.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 kPa" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡suelta el sensor! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Agua: cada metro suma 10 kPa. La tecla que brilla te guía.",
    pista: "Otros líquidos: aceite, mercurio y agua de mar.",
    solo: "Presión absoluta: súmale la atmosférica.",
  },
};

const textoLiquido = (p: ProblemaPresion) => `${LIQUIDOS[p.liquido].nombre} · ρ = ${LIQUIDOS[p.liquido].rho} kg/m³`;

/** La cuenta: «P = 1000·10·3 = 30 kPa» (absoluta: «P = 100 + 1000·10·2/1000 = 120 kPa»). */
function cuenta(p: ProblemaPresion): string {
  const rho = LIQUIDOS[p.liquido].rho;
  const man = (rho * 10 * p.h) / 1000;
  return p.absoluta ? `P = 100 + ${rho}·10·${fmtF(p.h)}/1000 = 100 + ${fmtF(man)} = ${p.respuesta} kPa` : `P = ${rho}·10·${fmtF(p.h)} = ${p.respuesta} kPa`;
}

const textoCorto = (p: ProblemaPresion) => `${LIQUIDOS[p.liquido].nombre} · ${fmtF(p.h)} m`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaPresion() {
  const motor = useEtapa<ProblemaPresion>({ clave: "n14-presion", rondas: RONDAS_PRESION, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const inicial = p.absoluta ? 100 : 1;
  const [st, setSt] = useState({ clave: "", v: 1 });
  const v = st.clave === clave ? st.v : inicial;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(P_MIN, Math.min(P_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡La aguja llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja se quedó ${v > p.respuesta ? "antes de" : "más allá de"} tu marca: la presión real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} kPa.` });
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
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_FLUIDOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPresion color={LIQUIDOS[p.liquido].color} h={p.h} absoluta={p.absoluta} P={p.respuesta} Ppropuesta={v} textoLiquido={textoLiquido(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPresion color={LIQUIDOS[it.liquido].color} h={it.h} absoluta={it.absoluta} P={it.respuesta} Ppropuesta={null} textoLiquido="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const liq = LIQUIDOS[p.liquido];
  const enunciado = (
    <>
      Un sensor baja a <b>{fmtF(p.h)} m</b> de profundidad en un tanque de <b>{liq.nombre}</b> (ρ = {liq.rho} kg/m³). ¿Qué presión {p.absoluta ? <b>absoluta</b> : <b>manométrica</b>} marca?{p.absoluta ? " (P atm = 100 kPa)" : ""}
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>ρ</V> <b>{liq.rho} kg/m³</b>
        </span>
        <span className="var-chip">
          <V>h</V> <b>{fmtF(p.h)} m</b>
        </span>
        <span className="var-chip">
          <V>g</V> <b>10 m/s²</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_PRESION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="P"
          valor={String(v)}
          unidad="kPa"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la presión">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la presión">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_FLUIDO} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PRESION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 kPa · ← → de 10 · Enter para soltar el sensor</span>}
    />
  );
}
