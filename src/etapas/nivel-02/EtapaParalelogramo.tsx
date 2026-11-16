// ══ Etapa 2.3 · Regla del paralelogramo: calcula el módulo de la resultante y escríbelo ───────
import { useState } from "react";
import { FORMULA_R, RONDAS_PARALELO, type ProblemaParalelo } from "@/contenido/nivel-02/vectores";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { useEntradaNumero } from "@/motor/useEntradaNumero";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaParalelogramo } from "@/three/vectores/EscenaParalelogramo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { DimTexto } from "@/ui/DimTexto";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, teclaDeCaracter, type DecoTecla } from "@/ui/TecladoVirtual";

const META: MetaEtapa = {
  numero: "2.3",
  titulo: "Regla del paralelogramo",
  nivel: "Análisis vectorial",
  nivelNum: 2,
  intro: (
    <>
      Si dos vectores forman un ángulo θ, la resultante es la diagonal del paralelogramo que forman. Su módulo sale de la <b>ley de cosenos</b>. Calcula R y escríbelo con el teclado.
    </>
  ),
  como: [
    { teclas: ["0", "9"], texto: "escribe el número (punto para decimales)" },
    { teclas: ["⏎"], texto: "comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/2/examen", titulo: "Etapa 2.4 · Examen" },
  descRondas: {
    guiado: "La resultante está en pantalla: escribe su valor encima.",
    pista: "Ves la fórmula y el paralelogramo; la resultante, no.",
    solo: "Solo los vectores y el ángulo. Cada pista cuesta una estrella.",
  },
};

const TECLAS_NUM: Record<string, DecoTecla> = {
  ...Object.fromEntries("0123456789".split("").map((d) => [d, {}])),
  ".": { sub: "decimal" },
  borrar: {},
  intro: { sub: "comprobar" },
  h: { sub: "pista" },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaParalelogramo() {
  const motor = useEtapa<ProblemaParalelo>({ clave: "n2-paralelogramo", rondas: RONDAS_PARALELO, avanceMs: 1800 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const ent = useEntradaNumero(clave, p.respuesta, guiado);
  const [fb, setFb] = useState<Retro | null>(null);
  const [errTecla, setErrTecla] = useState<{ k: string; id: number } | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const acertar = () => {
    motor.acierto();
    setFb({ clave, tipo: "ok", texto: `¡Exacto! R = ${p.respuesta}${p.caso ? ` (${p.caso})` : ""}.` });
  };

  const teclear = (k: string) => {
    if (!motor.jugando) return;
    const r = ent.escribir(k);
    if (r === "ignorada") return;
    if (r === "mal") {
      motor.error();
      setErrTecla((e) => ({ k: k === "," ? "." : k, id: (e?.id ?? 0) + 1 }));
      setFb({ clave, tipo: "mal", texto: "Esa tecla no va ahí: sigue la tecla que brilla." });
      return;
    }
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
    if (r === "completo") acertar();
  };

  const comprobar = () => {
    if (!motor.jugando || guiado) return;
    const c = ent.comprobar();
    if (c.incompleto) {
      setFb({ clave, tipo: "info", texto: "Escribe el valor de R." });
      return;
    }
    if (c.ok) return acertar();
    motor.error();
    setErrTecla((e) => ({ k: "intro", id: (e?.id ?? 0) + 1 }));
    const v = ent.valor ?? 0;
    const maxR = p.a + p.b;
    const minR = Math.abs(p.a - p.b);
    const texto = v > maxR ? `R nunca supera A + B = ${maxR}.` : v < minR ? `R nunca es menor que |A − B| = ${minR}.` : "No es correcto. Revisa el coseno del ángulo.";
    setFb({ clave, tipo: "mal", texto });
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    const n = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: p.pistas[n - 1] });
  };

  const accion = (k: string) => {
    if (!motor.jugando) return;
    if (k === "intro") comprobar();
    else if (k === "borrar") {
      ent.borrar();
      sfx.borrar();
    } else if (k === "h") pedirPista();
    else teclear(k);
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "Enter") accion("intro");
    else if (e.key === "Backspace") accion("borrar");
    else if (e.key === "Escape") ent.limpiar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") accion("h");
    else teclear(e.key);
  });

  const exito = motor.fase === "exito";
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={10}
      render={(x, rol) =>
        rol === "actual" ? (
          <EscenaParalelogramo a={p.a} b={p.b} angulo={p.angulo} r={exito ? "solida" : guiado ? "fantasma" : "oculta"} valorR={p.respuesta} faseId={motor.faseId} />
        ) : (
          <EscenaParalelogramo a={x.a} b={x.b} angulo={x.angulo} r="oculta" etiquetas={false} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">Calcula el módulo de la resultante</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>A</V> <b style={{ color: "#86b2ff" }}>{p.a}</b>
        </span>
        <span className="var-chip">
          <V>B</V> <b style={{ color: "#ff8a5c" }}>{p.b}</b>
        </span>
        <span className="var-chip">
          <V>θ</V> <b>{p.angulo}°</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{FORMULA_R}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 2}>
            Pista <span className="btn-meta">{motor.pistas}/2</span>
          </button>
          {!guiado && (
            <button className="btn btn-pri" onClick={comprobar} disabled={!motor.jugando}>
              Comprobar
            </button>
          )}
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
        <div className={`rc-linea ${retro?.tipo === "mal" ? "sacudir" : ""} ${exito ? "rc-ok" : ""}`} key={`r${motor.faseId}`}>
          <span className="rc-lado">
            <i className="fx-v" style={{ color: "#f0b44c" }}>
              R
            </i>
            <span className="rc-igual">=</span>
          </span>
          <DimTexto texto={ent.texto} guia={guiado ? ent.objetivo : undefined} cursor={motor.jugando} colorear={false} numero />
        </div>
      }
      teclado={
        <TecladoVirtual
          activas={{ ...TECLAS_NUM, ...(guiado ? { intro: {} } : {}) }}
          siguiente={guiado && motor.jugando ? teclaDeCaracter(ent.objetivo[ent.texto.length]) : null}
          onTecla={accion}
          error={errTecla}
        />
      }
      escenario={{ encuadre: { w: 8.5, h: 6.2 }, balanceo: 0.08, vista: clave }}
    />
  );
}
