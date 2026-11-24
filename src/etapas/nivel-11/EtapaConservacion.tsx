// ══ Etapa 11.2 · Conservación de la cantidad de movimiento: choques plásticos y explosiones con fantasma después del choque ───────
import { useState } from "react";
import { conSigno, V_MAX, V_MIN } from "@/contenido/nivel-11/impulso";
import { F_CONSERVACION, RONDAS_CONSERVACION, type ProblemaConservacion } from "@/contenido/nivel-11/conservacion";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaRiel } from "@/three/momento/EscenaRiel";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_MOMENTO, ESCENARIO_RIEL, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "11.2",
  titulo: "Conservación de la cantidad de movimiento",
  nivel: "Cantidad de movimiento y choques",
  nivelNum: 11,
  intro: (
    <>
      Si sobre un sistema no actúan fuerzas externas, su <b>cantidad de movimiento total se conserva</b>: lo que tenían antes del choque es lo que tienen después. En un <b>choque plástico</b> quedan pegados; en una <b>explosión</b> parten del reposo, así que el total es cero. Predice la velocidad: un <b>fantasma</b> saldrá del choque con ella.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la velocidad (1 m/s; negativa = hacia la izquierda)" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Choque plástico con uno en reposo. La tecla que brilla te guía.",
    pista: "Los dos se mueven: ojo con los signos.",
    solo: "Explosiones: el total antes es cero.",
  },
};

const TECLAS_V: Record<string, DecoTecla> = {
  "↑": { sub: "+1 m/s" },
  "↓": { sub: "−1 m/s" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

const entre = (v: number) => (v < 0 ? `(${conSigno(v)})` : conSigno(v));

/** La cuenta: «2·6 + 1·0 = 3·v → v = 4 m/s» o «2·(−3) + 1·v = 0 → v = 6 m/s». */
function cuenta(p: ProblemaConservacion): string {
  if (p.tipo === "explosion") return `${p.m1}·${entre(p.w1)} + ${p.m2}·v = 0 → v = ${conSigno(p.respuesta)} m/s`;
  return `${p.m1}·${entre(p.u1)} + ${p.m2}·${entre(p.u2)} = ${p.m1 + p.m2}·v → v = ${conSigno(p.respuesta)} m/s`;
}

const textoCorto = (p: ProblemaConservacion) => (p.tipo === "plastico" ? `${p.m1} kg + ${p.m2} kg` : `explosión · ${p.m1} kg y ${p.m2} kg`);

/** «en reposo», «que va a 3 m/s hacia la derecha», «que viene a 8 m/s hacia la izquierda». */
const comoVa = (v: number) => (v === 0 ? "en reposo" : v > 0 ? `que va a ${v} m/s hacia la derecha` : `que viene a ${-v} m/s hacia la izquierda`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaConservacion() {
  const motor = useEtapa<ProblemaConservacion>({ clave: "n11-conservacion", rondas: RONDAS_CONSERVACION, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡Van juntos! ${cuenta(p)}.` });
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
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;
  const plastico = p.tipo === "plastico";
  const w1 = plastico ? p.respuesta : p.w1;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_MOMENTO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaRiel
            m1={p.m1}
            m2={p.m2}
            modo={plastico ? "choque" : "explosion"}
            u1={p.u1}
            u2={p.u2}
            w1={w1}
            w2={p.respuesta}
            fantasmaDe={plastico ? "juntos" : 2}
            propuesta={v}
            rotulo={exito ? `v = ${conSigno(p.respuesta)} m/s` : null}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaRiel m1={it.m1} m2={it.m2} modo={it.tipo === "plastico" ? "choque" : "explosion"} u1={it.u1} u2={it.u2} w1={it.tipo === "plastico" ? it.respuesta : it.w1} w2={it.respuesta} fantasmaDe={it.tipo === "plastico" ? "juntos" : 2} propuesta={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = plastico ? (
    <>
      Un carrito de <b>{p.m1} kg</b> que va a <b>{p.u1} m/s</b> hacia la derecha choca con otro de <b>{p.m2} kg</b> {comoVa(p.u2)}, y quedan pegados. ¿Con qué velocidad se mueven juntos? (positiva = hacia la derecha)
    </>
  ) : (
    <>
      Dos carritos de <b>{p.m1} kg</b> y <b>{p.m2} kg</b> están en reposo con un resorte comprimido entre ellos. Al soltarlo, el de {p.m1} kg sale a <b>{-p.w1} m/s</b> hacia la izquierda. ¿Con qué velocidad sale el de {p.m2} kg?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V>₁ <b>{p.m1} kg</b>
        </span>
        <span className="var-chip">
          <V>m</V>₂ <b>{p.m2} kg</b>
        </span>
        {plastico ? (
          <>
            <span className="var-chip">
              <V>v</V>₁ <b>{conSigno(p.u1)} m/s</b>
            </span>
            <span className="var-chip">
              <V>v</V>₂ <b>{conSigno(p.u2)} m/s</b>
            </span>
          </>
        ) : (
          <span className="var-chip">
            <V>v</V>₁′ <b>{conSigno(p.w1)} m/s</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CONSERVACION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
      escenario={{ ...ESCENARIO_RIEL, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la velocidad · Enter para soltar</span>}
    />
  );
}
