// ══ Etapa 5.2 · De x–t a v–t: la pendiente de cada tramo es la altura de su barra de velocidad ───────
import { useState } from "react";
import { F_PENDIENTE, RONDAS_VT, type ProblemaVT } from "@/contenido/nivel-05/graficas";
import { escalones, integrar, interpolar, puntosDe } from "@/lib/graficas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGrafica } from "@/three/grafica/EscenaGrafica";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Sub, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { AZUL, CARRUSEL_GRAFICA, ESCENARIO_GRAFICA, simularTecla, TECLAS_EDITAR, ValorTexto, VERDE } from "./comun";

const META: MetaEtapa = {
  numero: "5.2",
  titulo: "De x–t a v–t",
  nivel: "Gráficas del movimiento",
  nivelNum: 5,
  intro: (
    <>
      Arriba tienes la gráfica <b>x–t</b>. Abajo arma su <b>v–t</b>: la velocidad de cada tramo es su pendiente, Δx / Δt. Al correr, un cursor recorre las dos gráficas a la vez y el auto sigue tu v–t.
    </>
  ),
  como: [
    { teclas: ["mouse"], texto: "arrastra una barra hacia arriba o abajo" },
    { teclas: ["←", "→"], texto: "elige el tramo" },
    { teclas: ["↑", "↓"], texto: "cambia la velocidad de 5 en 5 m/s" },
    { teclas: ["⏎"], texto: "¡corre! y compara con el fantasma" },
  ],
  siguiente: { ruta: "/nivel/5/area", titulo: "Etapa 5.3 · Área = desplazamiento" },
  descRondas: {
    guiado: "Las barras fantasma muestran la v–t correcta: lleva cada barra a ella.",
    pista: "Calcula Δx / Δt de cada tramo de la x–t.",
    solo: "Solo la x–t. Arma la v–t y corre.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;

export default function EtapaVelocidadVT() {
  const motor = useEtapa<ProblemaVT>({ clave: "n5-velocidad", rondas: RONDAS_VT, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const n = p.vs.length;
  const T = n * p.dt;
  const [st, setSt] = useState<{ clave: string; vs: number[]; sel: number }>({ clave: "", vs: [], sel: 0 });
  const vs = st.clave === clave ? st.vs : Array(n).fill(0);
  const sel = st.clave === clave ? st.sel : 0;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFantasma = guiado || motor.pistas >= 3;
  const malos = vs.map((v, i) => (v === p.vs[i] ? -1 : i)).filter((i) => i >= 0);
  const tramo = (i: number) => `${i * p.dt}–${(i + 1) * p.dt} s`;

  const fijar = (nvs: number[], nsel: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, vs: nvs, sel: Math.max(0, Math.min(n - 1, nsel)) });
    if (retro && retro.tipo !== "ok") setFb(null);
  };
  const cambiar = (i: number, v: number) => fijar(vs.map((x, j) => (j === i ? Math.max(-p.vMax, Math.min(p.vMax, v)) : x)), i);

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
      setFb({ clave, tipo: "ok", texto: "¡Exacto! La pendiente de cada tramo es su velocidad." });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El auto se separó del fantasma: revisa el tramo ${tramo(malos[0])} (pendiente = Δx / Δt).` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const k = motor.pistas + 1;
    setFb({ clave, tipo: "info", texto: k >= 3 ? "Las barras fantasma muestran la v–t correcta." : p.pistas[k - 1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    const k = e.key;
    if (k === "ArrowLeft") { e.preventDefault(); fijar(vs, sel - 1); sfx.tecla(); }
    else if (k === "ArrowRight") { e.preventDefault(); fijar(vs, sel + 1); sfx.tecla(); }
    else if (k === "ArrowUp") { e.preventDefault(); cambiar(sel, vs[sel] + PASO); sfx.tecla(); }
    else if (k === "ArrowDown") { e.preventDefault(); cambiar(sel, vs[sel] - PASO); sfx.tecla(); }
    else if (k === "Enter") correr();
    else if (k.toLowerCase() === "h" || k === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  let siguienteTecla: string | null = null;
  if (guiado && motor.jugando && !corriendo) {
    const objetivo = malos.length ? malos.reduce((a, b) => (Math.abs(b - sel) < Math.abs(a - sel) ? b : a)) : -1;
    if (objetivo < 0) siguienteTecla = "intro";
    else if (objetivo !== sel) siguienteTecla = objetivo > sel ? "→" : "←";
    else siguienteTecla = vs[sel] < p.vs[sel] ? "↑" : "↓";
  }
  const xt = puntosDe(p.xs, p.dt);
  const pasos = escalones(vs, p.dt);

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
              { eje: "x", yMin: p.xMin, yMax: p.xMax, series: [{ puntos: xt, color: AZUL }] },
              {
                eje: "v",
                yMin: -p.vMax,
                yMax: p.vMax,
                series: verFantasma ? [{ puntos: escalones(p.vs, p.dt), color: "#f0b44c", fantasma: true }] : [],
                editable: { tipo: "barras", valores: vs, dt: p.dt, color: VERDE, seleccion: sel, paso: PASO, activo: motor.jugando && !corriendo, onCambio: cambiar, onSeleccion: (i) => fijar(vs, i) },
              },
            ]}
            pista={{ xMin: p.xMin, xMax: p.xMax, x: (t) => p.xs[0] + integrar(pasos, t), fantasma: (t) => interpolar(xt, t) }}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaGrafica T={it.vs.length * it.dt} paneles={[{ eje: "x", yMin: it.xMin, yMax: it.xMax, series: [{ puntos: puntosDe(it.xs, it.dt), color: AZUL }] }]} previa={rol === "siguiente" ? "x–t → v–t" : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">Arma la gráfica v–t que corresponde a esta x–t.</p>
      <div className="definicion">{<Formula tam="m">{F_PENDIENTE}</Formula>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => fijar(vs, sel - 1)} disabled={!motor.jugando}>
            ◀
          </button>
          <button className="btn" onClick={() => cambiar(sel, vs[sel] - PASO)} disabled={!motor.jugando}>
            −
          </button>
          <button className="btn" onClick={() => cambiar(sel, vs[sel] + PASO)} disabled={!motor.jugando}>
            +
          </button>
          <button className="btn" onClick={() => fijar(vs, sel + 1)} disabled={!motor.jugando}>
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
              <V>v</V>
              <Sub>{tramo(sel)}</Sub>
            </>
          }
          valor={String(vs[sel])}
          unidad="m/s"
          ok={exito}
          mal={retro?.tipo === "mal"}
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_EDITAR} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GRAFICA, vista: clave }}
      pieEscena={<span>Arrastra las barras de la v–t o usa las flechas · Enter para correr</span>}
    />
  );
}
