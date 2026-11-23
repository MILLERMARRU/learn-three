// ══ Etapa 7.3 · Momento de una fuerza: ajusta una fuerza o un brazo para que ΣM = 0 y la barra quede horizontal ───────
import { useState, type ReactNode } from "react";
import { cargasBarra, escalaBarra, F_MOMENTO, MEDIA_BARRA, RONDAS_MOMENTO, type ProblemaMomento } from "@/contenido/nivel-07/momento";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPalanca } from "@/three/estatica/EscenaPalanca";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_FUERZAS, ESCENARIO_FUERZAS, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "7.3",
  titulo: "Momento de una fuerza",
  nivel: "Estática",
  nivelNum: 7,
  intro: (
    <>
      Una fuerza que actúa lejos del apoyo hace girar la barra: su <b>momento</b> es <b>M = F · d</b> (d es el brazo, la distancia al apoyo). Para que la barra no gire, los momentos se anulan: <b>ΣM = 0</b> (segunda condición de equilibrio). Ajusta la fuerza o el brazo que falta y suelta la barra.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la fuerza o el brazo" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/7/examen", titulo: "Etapa 7.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "El momento neto ΣM aparece sobre la barra: llévalo a cero. La tecla que brilla te guía.",
    pista: "Iguala los momentos que giran hacia cada lado.",
    solo: "La barra también pesa: su peso actúa en el centro.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const lado = (x: number, p: ProblemaMomento) => (x < p.pivote ? "a la izquierda" : "a la derecha");
const brazo = (x: number, p: ProblemaMomento) => fmtNum(Math.abs(x - p.pivote));
const fmtV = (p: ProblemaMomento, v: number) => (p.unidad === "m" ? fmtNum(v) : String(v));

function enunciado(p: ProblemaMomento): ReactNode {
  const barra = p.barra > 0 ? `Una barra homogénea de 8 m que pesa ${p.barra} N se apoya a ${fmtNum(MEDIA_BARRA + p.pivote)} m de su extremo izquierdo.` : "Una barra ligera de 8 m se apoya en su punto medio.";
  const pesas = p.pesas.map((q) => `${q.W} N a ${brazo(q.x, p)} m ${lado(q.x, p)}`).join(", ");
  return (
    <>
      {barra} {p.pesas.length === 1 ? "Cuelga una pesa de" : "Cuelgan pesas de"} {pesas}.{" "}
      {p.tipo === "fuerza" ? (
        <>
          ¿Con qué fuerza hay que tirar hacia abajo a <b>{brazo(p.fuerzaX, p)} m</b> {lado(p.fuerzaX, p)} del apoyo para que quede horizontal?
        </>
      ) : (
        <>
          ¿A qué distancia del apoyo, {p.movil && p.movil.lado > 0 ? "a la derecha" : "a la izquierda"}, hay que colgar la pesa de <b>{p.movil?.W} N</b> para equilibrarla?
        </>
      )}
    </>
  );
}

const textoCorto = (p: ProblemaMomento) => `${p.pesas.length} pesa${p.pesas.length > 1 ? "s" : ""}${p.barra > 0 ? " · barra que pesa" : ""}`;

export default function EtapaMomento() {
  const motor = useEtapa<ProblemaMomento>({ clave: "n7-momento", rondas: RONDAS_MOMENTO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.min;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  // brazo máximo de la pesa que se desplaza: hasta el extremo de la barra
  const maxV = p.tipo === "distancia" && p.movil ? Math.min(p.max, MEDIA_BARRA - p.movil.lado * p.pivote) : p.max;
  const simbolo = p.tipo === "fuerza" ? "F" : "d";
  const teclas: Record<string, DecoTecla> = {
    "↑": { sub: `+${fmtNum(p.paso)} ${p.unidad}` },
    "↓": { sub: `−${fmtNum(p.paso)} ${p.unidad}` },
    intro: { sub: "¡suelta!" },
    h: { sub: "pista" },
  };

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.round(Math.max(p.min, Math.min(maxV, v + d)) * 100) / 100 });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const soltar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = ({ equilibrio, momento }: { equilibrio: boolean; momento: number }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (equilibrio) {
      motor.acierto();
      const giraIzq = cargasBarra(p, v)
        .filter((c) => c.x < p.pivote)
        .reduce((s, c) => s + c.F * (p.pivote - c.x), 0);
      setFb({ clave, tipo: "ok", texto: `¡Equilibrio! Con ${simbolo} = ${fmtV(p, v)} ${p.unidad}, los momentos de cada lado valen ${fmtNum(giraIzq)} N·m: ΣM = 0.` });
    } else {
      motor.error();
      const gana = momento > 0 ? "la izquierda" : "la derecha";
      const consejo = p.tipo === "fuerza" ? (momento > 0 ? "Sube F." : "Baja F.") : (momento > 0) === (p.movil?.lado === 1) ? "Aleja la pesa del apoyo." : "Acércala al apoyo.";
      setFb({ clave, tipo: "mal", texto: `ΣM = ${fmtNum(Math.abs(momento))} N·m a favor de ${gana}: la barra gira. ${consejo}` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cambiar(p.paso);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-p.paso);
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta - 1e-9 ? "↑" : v > p.respuesta + 1e-9 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_FUERZAS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPalanca
            pivote={p.pivote}
            cargas={cargasBarra(p, v)}
            media={MEDIA_BARRA}
            escala={escalaBarra(p)}
            medios={p.unidad === "m"}
            verMomento={guiado || !!enCurso?.fin}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaPalanca pivote={it.pivote} cargas={cargasBarra(it, it.respuesta)} media={MEDIA_BARRA} escala={escalaBarra(it)} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado(p)}</p>
      <div className="variables" key={clave}>
        {p.pesas.map((q, i) => (
          <span className="var-chip" key={i}>
            <b>
              {q.W} N · {brazo(q.x, p)} m {q.x < p.pivote ? "←" : "→"}
            </b>
          </span>
        ))}
        {p.barra > 0 && (
          <span className="var-chip">
            <V>P</V> <b>{p.barra} N</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_MOMENTO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-p.paso)} disabled={!motor.jugando}>
            − {simbolo}
          </button>
          <button className="btn" onClick={() => cambiar(p.paso)} disabled={!motor.jugando}>
            + {simbolo}
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
          simbolo={simbolo}
          valor={fmtV(p, v)}
          unidad={p.unidad}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(p.paso)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-p.paso)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclas} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_FUERZAS, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta {p.tipo === "fuerza" ? "la fuerza" : "el brazo"} · Enter para soltar</span>}
    />
  );
}

