// ══ Etapa 5.1 · Dibuja la x–t: arrastra los puntos de la gráfica y mira si el auto hace lo que dice el enunciado ───────
import { useState } from "react";
import { F_PENDIENTE, RONDAS_XT, type ProblemaXT } from "@/contenido/nivel-05/graficas";
import { interpolar, puntosDe } from "@/lib/graficas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGrafica } from "@/three/grafica/EscenaGrafica";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { AZUL, CARRUSEL_GRAFICA, ESCENARIO_GRAFICA, simularTecla, TECLAS_EDITAR, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "5.1",
  titulo: "Dibuja la x–t",
  nivel: "Gráficas del movimiento",
  nivelNum: 5,
  intro: (
    <>
      En la gráfica <b>posición–tiempo</b> la pendiente es la velocidad: subir es avanzar, bajar es regresar y horizontal es estar quieto. Arrastra los puntos para dibujar el movimiento del enunciado y pulsa Enter: el auto obedecerá a tu gráfica.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "arrastra un punto hacia arriba o abajo" },
    { teclas: ["←", "→"], texto: "elige el punto" },
    { teclas: ["↑", "↓"], texto: "mueve el punto de 5 en 5 m" },
    { teclas: ["⏎"], texto: "¡corre! y compara con el auto fantasma" },
  ],
  siguiente: { ruta: "/nivel/5/velocidad", titulo: "Etapa 5.2 · De x–t a v–t" },
  descRondas: {
    guiado: "La gráfica fantasma muestra la correcta: lleva cada punto a ella.",
    pista: "Lee el enunciado tramo por tramo; la pendiente es la velocidad.",
    solo: "Solo el enunciado. Dibuja y corre.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;

export default function EtapaDibujaXT() {
  const motor = useEtapa<ProblemaXT>({ clave: "n5-dibuja", rondas: RONDAS_XT, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const n = p.xs.length;
  const T = (n - 1) * p.dt;
  const [st, setSt] = useState<{ clave: string; xs: number[]; sel: number }>({ clave: "", xs: [], sel: 0 });
  const xs = st.clave === clave ? st.xs : Array(n).fill(0);
  const sel = st.clave === clave ? st.sel : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFantasma = guiado || motor.pistas >= 3;
  const malos = xs.map((x, i) => (x === p.xs[i] ? -1 : i)).filter((i) => i >= 0);

  const fijar = (nxs: number[], nsel: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, xs: nxs, sel: Math.max(0, Math.min(n - 1, nsel)) });
    if (retro && retro.tipo !== "ok") setFb(null);
  };
  const cambiar = (i: number, v: number) => fijar(xs.map((x, j) => (j === i ? Math.max(p.yMin, Math.min(p.yMax, v)) : x)), i);

  const correr = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (malos.length === 0) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: "¡Tu gráfica describe ese movimiento! El auto y el fantasma van juntos." });
    } else {
      motor.error();
      const ts = malos.map((i) => `${i * p.dt} s`).join(", ");
      setFb({ clave, tipo: "mal", texto: `El auto se separó del fantasma: revisa ${malos.length === 1 ? "el punto en" : "los puntos en"} t = ${ts}.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const k = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: k >= 3 ? "La gráfica fantasma muestra la correcta." : p.pistas[k - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const k = e.key;
    if (k === "ArrowLeft") (e.preventDefault(), fijar(xs, sel - 1), sfx.tecla());
    else if (k === "ArrowRight") (e.preventDefault(), fijar(xs, sel + 1), sfx.tecla());
    else if (k === "ArrowUp") (e.preventDefault(), cambiar(sel, xs[sel] + PASO), sfx.tecla());
    else if (k === "ArrowDown") (e.preventDefault(), cambiar(sel, xs[sel] - PASO), sfx.tecla());
    else if (k === "Enter") correr();
    else if (k.toLowerCase() === "h" || k === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  let siguienteTecla: string | null = null;
  if (guiado && motor.jugando && !corriendo) {
    const objetivo = malos.length ? malos.reduce((a, b) => (Math.abs(b - sel) < Math.abs(a - sel) ? b : a)) : -1;
    if (objetivo < 0) siguienteTecla = "intro";
    else if (objetivo !== sel) siguienteTecla = objetivo > sel ? "→" : "←";
    else siguienteTecla = xs[sel] < p.xs[sel] ? "↑" : "↓";
  }
  const usuario = puntosDe(xs, p.dt);
  const correcta = puntosDe(p.xs, p.dt);

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_GRAFICA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGrafica
            T={T}
            paneles={[
              {
                eje: "x",
                yMin: p.yMin,
                yMax: p.yMax,
                series: verFantasma ? [{ puntos: correcta, color: "#f0b44c", fantasma: true }] : [],
                editable: { tipo: "puntos", valores: xs, dt: p.dt, color: AZUL, seleccion: sel, paso: PASO, activo: motor.jugando && !corriendo, onCambio: cambiar, onSeleccion: (i) => fijar(xs, i) },
              },
            ]}
            pista={{ xMin: p.yMin, xMax: p.yMax, x: (t) => interpolar(usuario, t), fantasma: (t) => interpolar(correcta, t) }}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaGrafica T={(it.xs.length - 1) * it.dt} paneles={[{ eje: "x", yMin: it.yMin, yMax: it.yMax }]} previa={rol === "siguiente" ? "dibuja la x–t" : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{p.descripcion}</p>
      <p className="hud-sub">Dibuja su gráfica x–t (puntos cada {p.dt} s).</p>
      <div className={`definicion ${motor.ronda !== "solo" || motor.pistas >= 1 ? "" : "oculta"}`}>
        {motor.ronda !== "solo" || motor.pistas >= 1 ? <Formula tam="m">{F_PENDIENTE}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}
      </div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => fijar(xs, sel - 1)} disabled={!motor.jugando}>
            ◀
          </button>
          <button className="btn" onClick={() => cambiar(sel, xs[sel] - PASO)} disabled={!motor.jugando}>
            −
          </button>
          <button className="btn" onClick={() => cambiar(sel, xs[sel] + PASO)} disabled={!motor.jugando}>
            +
          </button>
          <button className="btn" onClick={() => fijar(xs, sel + 1)} disabled={!motor.jugando}>
            ▶
          </button>
          <button className="btn btn-pri" onClick={correr} disabled={!motor.jugando || corriendo}>
            ¡Corre!
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
          simbolo={
            <>
              <V>x</V>
              <Sub>{`t = ${sel * p.dt} s`}</Sub>
            </>
          }
          valor={String(xs[sel])}
          unidad="m"
          ok={exito}
          mal={retro?.tipo === "mal"}
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_EDITAR} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GRAFICA, vista: clave }}
      pieEscena={<span>Arrastra los puntos o usa las flechas · Enter para correr</span>}
    />
  );
}
