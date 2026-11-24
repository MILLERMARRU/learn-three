// ══ Etapa 11.1 · Impulso y cantidad de movimiento: predice la velocidad tras el golpe y un disco fantasma sale con ella ───────
import { useState } from "react";
import { conSigno, F_IMPULSO, RONDAS_IMPULSO, V_MAX, V_MIN, type ProblemaImpulso } from "@/contenido/nivel-11/impulso";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGolpe } from "@/three/momento/EscenaGolpe";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_MOMENTO, ESCENARIO_GOLPE, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "11.1",
  titulo: "Impulso y cantidad de movimiento",
  nivel: "Cantidad de movimiento y choques",
  nivelNum: 11,
  intro: (
    <>
      Un golpe es una fuerza grande durante un tiempo corto. Su efecto es el <b>impulso: I = F·Δt</b>, el área bajo la gráfica F–t, y cambia la <b>cantidad de movimiento</b> (p = m·v): F·Δt = m·v − m·v₀. Las velocidades llevan signo: <b>positivo hacia la derecha</b>. Predice la velocidad del disco tras el golpe: un <b>disco fantasma</b> saldrá con ella.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la velocidad (1 m/s; negativa = hacia la izquierda)" },
    { teclas: ["⏎"], texto: "¡golpea! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/11/conservacion", titulo: "Etapa 11.2 · Conservación de la cantidad de movimiento" },
  descRondas: {
    guiado: "Desde el reposo: v = I / m. La tecla que brilla te guía.",
    pista: "El disco ya se movía: suma el impulso a lo que traía.",
    solo: "Golpes en contra, rebotes y una fuerza que sube y baja.",
  },
};

const TECLAS_V: Record<string, DecoTecla> = {
  "↑": { sub: "+1 m/s" },
  "↓": { sub: "−1 m/s" },
  intro: { sub: "¡golpea!" },
  h: { sub: "pista" },
};

/** La cuenta: «I = 20 N·s → v = 0 + 20/2 = 10 m/s». */
function cuenta(p: ProblemaImpulso): string {
  const I = p.I < 0 ? `(${conSigno(p.I)})` : conSigno(p.I);
  return `I = ${conSigno(p.I)} N·s → v = ${conSigno(p.v0)} + ${I}/${fmtNum(p.m, 1)} = ${conSigno(p.respuesta)} m/s`;
}

const textoCorto = (p: ProblemaImpulso) => `F = ${conSigno(p.F)} N · ${fmtNum(p.dt, 2)} s`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaImpulso() {
  const motor = useEtapa<ProblemaImpulso>({ clave: "n11-impulso", rondas: RONDAS_IMPULSO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // se parte de la velocidad que traía
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : p.v0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const golpear = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡Salen juntos! ${cuenta(p)}.` });
    } else {
      motor.error();
      const sentido = Math.sign(v) !== Math.sign(p.respuesta) ? "El fantasma salió hacia el otro lado" : `El fantasma ${Math.abs(v) > Math.abs(p.respuesta) ? "se adelantó" : "se quedó atrás"}`;
      setFb({ clave, tipo: "mal", texto: `${sentido}: la velocidad real es ${v > p.respuesta ? "menor" : "mayor"} que ${conSigno(v)} m/s.` });
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
      cambiar(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-1);
    } else if (e.key === "Enter") golpear();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MOMENTO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGolpe m={p.m} F={p.F} v0={p.v0} forma={p.forma} vReal={p.respuesta} vFantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaGolpe m={it.m} F={it.F} v0={it.v0} forma={it.forma} vReal={it.respuesta} vFantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const sentidoF = p.F > 0 ? "hacia la derecha" : "hacia la izquierda";
  const golpe =
    p.forma === "tri" ? (
      <>
        un golpe cuya fuerza sube hasta <b>{Math.abs(p.F)} N</b> y vuelve a cero en <b>{fmtNum(p.dt, 2)} s</b> ({sentidoF})
      </>
    ) : (
      <>
        un golpe de <b>{Math.abs(p.F)} N</b> {sentidoF} durante <b>{fmtNum(p.dt, 2)} s</b>
      </>
    );
  const enunciado = (
    <>
      Un disco de <b>{fmtNum(p.m, 1)} kg</b> {p.v0 === 0 ? "está en reposo" : <>se mueve a <b>{Math.abs(p.v0)} m/s</b> hacia la {p.v0 > 0 ? "derecha" : "izquierda"}</>} y recibe {golpe}. ¿Con qué velocidad sale? (positiva = hacia la derecha)
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{fmtNum(p.m, 1)} kg</b>
        </span>
        <span className="var-chip">
          <V>F</V> <b>{conSigno(p.F)} N</b>
        </span>
        <span className="var-chip">
          Δ<V>t</V> <b>{fmtNum(p.dt, 2)} s</b>
        </span>
        <span className="var-chip">
          <V>v</V>₀ <b>{conSigno(p.v0)} m/s</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_IMPULSO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − v
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + v
          </button>
          <button className="btn btn-pri" onClick={golpear} disabled={!motor.jugando || corriendo}>
            ¡Golpea!
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
          simbolo="v"
          valor={conSigno(v)}
          unidad="m/s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la velocidad">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la velocidad">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_V} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GOLPE, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la velocidad · Enter para golpear</span>}
    />
  );
}
