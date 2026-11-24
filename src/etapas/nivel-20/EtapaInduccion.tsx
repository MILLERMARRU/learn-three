// ══ Etapa 20.3 · Inducción electromagnética: el foco se enciende y el voltímetro debe llegar a la marca propuesta ───────
import { useState } from "react";
import { E_ESCALA, F_BARRA, F_BOBINA, RONDAS_INDUCCION, type ProblemaInduccion } from "@/contenido/nivel-20/induccion";
import { F_MIN, fmtM } from "@/contenido/nivel-20/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaInduccion } from "@/three/magnetismo/EscenaInduccion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_MAGNETISMO, ESCENARIO_INDUCCION, simularTecla, teclasMagnetismo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "20.3",
  titulo: "Inducción electromagnética",
  nivel: "Electromagnetismo",
  nivelNum: 20,
  intro: (
    <>
      Un campo magnético que <b>cambia</b> dentro de un circuito crea en él una fem: es la <b>inducción</b> (Faraday), el principio de los generadores. Una barra que corta las líneas de campo genera <b>ε = B·L·v</b>; una bobina de N espiras cuyo flujo Φ = B·A cambia en Δt genera <b>ε = N·ΔΦ/Δt</b>. Propón la fem: el voltímetro debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 V" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡mueve! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/20/examen", titulo: "Etapa 20.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "Barra en el campo: ε = B·L·v. La tecla que brilla te guía.",
    pista: "Longitudes en cm: pásalas a metros.",
    solo: "Bobina: ε = N·ΔΦ/Δt, con ΔΦ = ΔB·A.",
  },
};

/** Rótulos de la escena (los datos del enunciado). */
function textos(p: ProblemaInduccion) {
  if (p.modo === "barra") return { textoArriba: `B = ${fmtM(p.B)} T ⊗`, textoAbajo: `v = ${p.v} m/s`, textoLado: `L = ${p.enCm ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}` };
  return { textoArriba: `N = ${p.N} · A = ${fmtM(p.A)} m²`, textoAbajo: `ΔB = ${fmtM(p.dB)} T en ${fmtM(p.dt)} s`, textoLado: "" };
}
const textoCorto = (p: ProblemaInduccion) => (p.modo === "barra" ? `barra a ${p.v} m/s` : `bobina de ${p.N}`);

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaInduccion): string {
  if (p.modo === "barra") return `ε = ${fmtM(p.B)} · ${fmtM(p.L)} · ${p.v} = ${p.respuesta} V`;
  const dPhi = Math.round(p.dB * p.A * 1e9) / 1e9;
  return `ΔΦ = ${fmtM(p.dB)} · ${fmtM(p.A)} = ${fmtM(dPhi)} Wb → ε = ${p.N} · ${fmtM(dPhi)} / ${fmtM(p.dt)} = ${p.respuesta} V`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaInduccion() {
  const motor = useEtapa<ProblemaInduccion>({ clave: "n20-induccion", rondas: RONDAS_INDUCCION, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(F_MIN, Math.min(E_ESCALA, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡El voltímetro llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la fem es ${v > p.respuesta ? "menor" : "mayor"} que ${v} V.` });
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

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MAGNETISMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaInduccion modo={p.modo} E={p.respuesta} propuesta={v} escala={E_ESCALA} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaInduccion modo={it.modo} E={it.respuesta} propuesta={null} escala={E_ESCALA} textoArriba="" textoAbajo="" textoLado="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const t = textos(p);
  const enunciado =
    p.modo === "barra" ? (
      <>
        Una barra de <b>{p.enCm ? `${Math.round(p.L * 100)} cm` : `${fmtM(p.L)} m`}</b> se desliza a <b>{p.v} m/s</b> sobre dos rieles, perpendicular a un campo de <b>{fmtM(p.B)} T</b>. ¿Qué fem se induce?
      </>
    ) : (
      <>
        Una bobina de <b>{p.N} espiras</b> y <b>{fmtM(p.A)} m²</b> ve aumentar el campo en <b>{fmtM(p.dB)} T</b> en <b>{fmtM(p.dt)} s</b>. ¿Qué fem se induce?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {[t.textoArriba, t.textoAbajo, t.textoLado]
          .filter(Boolean)
          .map((x) => (
            <span key={x} className="var-chip">
              <b>{x}</b>
            </span>
          ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.modo === "barra" ? F_BARRA : F_BOBINA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="ε"
          valor={String(v)}
          unidad="V"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la fem">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la fem">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasMagnetismo("¡mueve!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_INDUCCION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 V · ← → de 10 · Enter para mover la barra o el imán</span>}
    />
  );
}
