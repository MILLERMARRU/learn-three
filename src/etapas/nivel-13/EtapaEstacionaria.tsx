// ══ Etapa 13.3 · Ondas estacionarias: frecuencia o longitud de onda del armónico n; la fantasma solo encaja si es correcta ───────
import { useState } from "react";
import { fmtO, O_MAX, O_MIN } from "@/contenido/nivel-13/onda";
import { F_ESTACIONARIA, RONDAS_ESTACIONARIA, vientresPropuestos, type ProblemaEstacionaria } from "@/contenido/nivel-13/estacionaria";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaEstacionaria } from "@/three/ondas/EscenaEstacionaria";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ONDAS, ESCENARIO_ESTACIONARIA, simularTecla, TECLAS_ONDA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "13.3",
  titulo: "Ondas estacionarias",
  nivel: "Ondas mecánicas",
  nivelNum: 13,
  intro: (
    <>
      En una cuerda fija en los dos extremos, las ondas que van y vuelven se superponen y forman una <b>onda estacionaria</b>: hay puntos que no se mueven (<b>nodos</b>) y otros que vibran al máximo (vientres). Solo caben ciertos modos: el armónico n tiene n vientres, <b>λₙ = 2L/n</b> y <b>fₙ = n·v/2L</b>. Propón el valor: la <b>cuerda fantasma</b> solo encaja entre los soportes si es el correcto.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡pulsa! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Modo fundamental: f₁ = v / 2L. La tecla que brilla te guía.",
    pista: "Armónicos: fₙ = n · v / 2L.",
    solo: "Longitudes de onda y armónicos a partir de la fundamental.",
  },
};

const unidad = (p: ProblemaEstacionaria) => (p.tipo === "f" ? "Hz" : "m");
const nombre = (p: ProblemaEstacionaria) => `${p.tipo === "f" ? "f" : "λ"}${String(p.n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[+d])}`;
const f1 = (p: ProblemaEstacionaria) => p.v / (2 * p.L);

/** La cuenta: «f₃ = 3·40/(2·2) = 30 Hz», «λ₂ = 2·3/2 = 3 m» o «f₃ = 3·12 = 36 Hz». */
function cuenta(p: ProblemaEstacionaria): string {
  if (p.tipo === "lambda") return `${nombre(p)} = 2·${fmtO(p.L)}/${p.n} = ${p.respuesta} m`;
  if (p.conF1) return `${nombre(p)} = ${p.n}·${fmtO(f1(p))} = ${p.respuesta} Hz`;
  return `${nombre(p)} = ${p.n}·${fmtO(p.v)}/(2·${fmtO(p.L)}) = ${p.respuesta} Hz`;
}

const textoCorto = (p: ProblemaEstacionaria) => `n = ${p.n} · L = ${fmtO(p.L)} m`;
const datoIzq = (p: ProblemaEstacionaria) => (p.conF1 ? `f₁ = ${fmtO(f1(p))} Hz` : `v = ${fmtO(p.v)} m/s`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaEstacionaria() {
  const motor = useEtapa<ProblemaEstacionaria>({ clave: "n13-estacionaria", rondas: RONDAS_ESTACIONARIA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 1 });
  const v = st.clave === clave ? st.v : 1;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const u = unidad(p);

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(O_MIN, Math.min(O_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const pulsar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡Encaja con ${p.n} ${p.n === 1 ? "vientre" : "vientres"}! ${cuenta(p)}.` });
    } else {
      motor.error();
      const nf = vientresPropuestos(p, v);
      const como = Number.isInteger(Math.round(nf * 1000) / 1000) && nf >= 1 ? `vibra con ${Math.round(nf)} ${Math.round(nf) === 1 ? "vientre" : "vientres"}` : "no encaja entre los soportes";
      setFb({ clave, tipo: "mal", texto: `La cuerda fantasma ${como}: el valor real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} ${u}.` });
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
    } else if (e.key === "Enter") pulsar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ONDAS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaEstacionaria
            n={p.n}
            nFantasma={vientresPropuestos(p, v)}
            L={p.L}
            v={p.v}
            datoIzq={datoIzq(p)}
            datoDer={`n = ${p.n}`}
            rotulo={exito ? `${nombre(p)} = ${p.respuesta} ${u}` : null}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaEstacionaria n={it.n} nFantasma={null} L={it.L} v={it.v} datoIzq="" datoDer="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const modo = p.n === 1 ? "su modo fundamental (1 vientre)" : `su armónico ${p.n} (${p.n} vientres)`;
  const enunciado =
    p.tipo === "lambda" ? (
      <>
        Una cuerda de <b>{fmtO(p.L)} m</b>, fija en los dos extremos, vibra en {modo}. ¿Cuál es la longitud de onda?
      </>
    ) : p.conF1 ? (
      <>
        La frecuencia fundamental de una cuerda es <b>{fmtO(f1(p))} Hz</b>. ¿Con qué frecuencia vibra en su armónico <b>{p.n}</b>?
      </>
    ) : (
      <>
        Una cuerda de <b>{fmtO(p.L)} m</b>, fija en los dos extremos, transmite ondas a <b>{fmtO(p.v)} m/s</b>. ¿Con qué frecuencia vibra en {modo}?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>n</V> <b>{p.n}</b>
        </span>
        {p.conF1 ? (
          <span className="var-chip">
            <V>f</V>₁ <b>{fmtO(f1(p))} Hz</b>
          </span>
        ) : (
          <>
            <span className="var-chip">
              <V>L</V> <b>{fmtO(p.L)} m</b>
            </span>
            {p.tipo === "f" && (
              <span className="var-chip">
                <V>v</V> <b>{fmtO(p.v)} m/s</b>
              </span>
            )}
          </>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_ESTACIONARIA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={pulsar} disabled={!motor.jugando || corriendo}>
            ¡Pulsa!
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
          simbolo={p.tipo === "f" ? "f" : "λ"}
          valor={String(v)}
          unidad={u}
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el valor">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el valor">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_ONDA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_ESTACIONARIA, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para pulsar la cuerda</span>}
    />
  );
}
