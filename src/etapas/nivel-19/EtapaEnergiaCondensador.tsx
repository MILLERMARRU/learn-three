// ══ Etapa 19.3 · Energía almacenada: al descargar en el foco, el medidor debe llegar a la marca propuesta ───────
import { useState } from "react";
import { F_ENERGIA_C, RONDAS_ENERGIA_C, U_ESCALA, type ProblemaEnergiaC } from "@/contenido/nivel-19/energia";
import { fmtC, Q_MIN } from "@/contenido/nivel-19/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaEnergia } from "@/three/condensadores/EscenaEnergia";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CONDENSADORES, ESCENARIO_ENERGIA_C, simularTecla, teclasCondensador, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "19.3",
  titulo: "Energía almacenada",
  nivel: "Condensadores",
  nivelNum: 19,
  intro: (
    <>
      Un condensador cargado guarda <b>energía</b> en el campo entre sus placas: <b>U = ½·C·V² = Q²/(2C) = ½·Q·V</b>. Al cerrar el interruptor se descarga y esa energía se libera de golpe, como el destello del flash de una cámara. Con μF y voltios la fórmula da μJ: aquí la respuesta va en mJ. Propón la energía: el medidor debe llegar a tu marca azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 mJ" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡descarga! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/19/examen", titulo: "Etapa 19.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "U = ½·C·V². La tecla que brilla te guía.",
    pista: "Con la carga: U = Q²/(2C) o U = ½·Q·V.",
    solo: "Asociaciones: primero la capacidad equivalente.",
  },
};

const textoCorto = (p: ProblemaEnergiaC) => ({ CV: "con C y V", QC: "con Q y C", QV: "con Q y V", serie: "en serie", paralelo: "en paralelo" })[p.dato];

/** Rótulos junto al condensador: solo los datos del enunciado. */
function textos(p: ProblemaEnergiaC): { textoArriba: string; textoAbajo: string } {
  if (p.dato === "CV") return { textoArriba: `C = ${fmtC(p.a)} μF`, textoAbajo: `V = ${p.b} V` };
  if (p.dato === "QC") return { textoArriba: `Q = ${p.a} μC`, textoAbajo: `C = ${fmtC(p.b)} μF` };
  if (p.dato === "QV") return { textoArriba: `Q = ${p.a} μC`, textoAbajo: `V = ${p.b} V` };
  return { textoArriba: `${(p.cs ?? []).join(" y ")} μF en ${p.dato}`, textoAbajo: `V = ${p.b} V` };
}

/** La cuenta de la respuesta. */
function cuenta(p: ProblemaEnergiaC): string {
  if (p.dato === "CV") return `U = ½ · ${fmtC(p.a)} · ${p.b}² = ${p.respuesta} mJ`;
  if (p.dato === "QC") return `U = ${p.a}² / (2 · ${fmtC(p.b)}) = ${p.respuesta} mJ`;
  if (p.dato === "QV") return `U = ½ · ${p.a} · ${p.b} = ${p.respuesta} mJ`;
  return `C = ${fmtC(p.C)} μF → U = ½ · ${fmtC(p.C)} · ${p.b}² = ${p.respuesta} mJ`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaEnergiaCondensador() {
  const motor = useEtapa<ProblemaEnergiaC>({ clave: "n19-energia", rondas: RONDAS_ENERGIA_C, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(Q_MIN, Math.min(U_ESCALA, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const descargar = () => {
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
      setFb({ clave, tipo: "mal", texto: `La aguja ${v > p.respuesta ? "se quedó antes de" : "pasó"} tu marca: la energía es ${v > p.respuesta ? "menor" : "mayor"} que ${v} mJ.` });
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
    } else if (e.key === "Enter") descargar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CONDENSADORES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaEnergia U={p.respuesta} propuesta={v} escala={U_ESCALA} {...textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaEnergia U={it.respuesta} propuesta={null} escala={U_ESCALA} textoArriba="" textoAbajo="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.dato === "CV" ? (
      <>
        Un condensador de <b>{fmtC(p.a)} μF</b> está cargado a <b>{p.b} V</b>. ¿Cuánta energía libera al descargarse (en mJ)?
      </>
    ) : p.dato === "QC" ? (
      <>
        Un condensador de <b>{fmtC(p.b)} μF</b> tiene una carga de <b>{p.a} μC</b>. ¿Cuánta energía guarda (en mJ)?
      </>
    ) : p.dato === "QV" ? (
      <>
        Un condensador con <b>{p.a} μC</b> está a <b>{p.b} V</b>. ¿Cuánta energía guarda (en mJ)?
      </>
    ) : (
      <>
        Condensadores de <b>{(p.cs ?? []).join(" μF y ")} μF</b> en <b>{p.dato}</b> se cargan a <b>{p.b} V</b>. ¿Cuánta energía guardan en total (en mJ)?
      </>
    );

  const t = textos(p);
  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <b>{t.textoArriba}</b>
        </span>
        <span className="var-chip">
          <b>{t.textoAbajo}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="m">{F_ENERGIA_C}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={descargar} disabled={!motor.jugando || corriendo}>
            ¡Descarga!
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
          simbolo="U"
          valor={String(v)}
          unidad="mJ"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la energía">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la energía">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCondensador("¡descarga!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ENERGIA_C, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 mJ · ← → de 10 · Enter para descargar en el foco</span>}
    />
  );
}
