// ══ Etapa 5.3 · Área = desplazamiento: calcula el área bajo la v–t y mírala pintarse mientras el auto avanza ───────
import { useState } from "react";
import { F_AREA, RONDAS_AREA, type ProblemaArea } from "@/contenido/nivel-05/graficas";
import { integrar } from "@/lib/graficas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGrafica } from "@/three/grafica/EscenaGrafica";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_GRAFICA, ESCENARIO_GRAFICA, fmtNum, simularTecla, TECLAS_VALOR, ValorTexto, VERDE } from "./comun";

const META: MetaEtapa = {
  numero: "5.3",
  titulo: "Área = desplazamiento",
  nivel: "Gráficas del movimiento",
  nivelNum: 5,
  intro: (
    <>
      En la gráfica <b>velocidad–tiempo</b> el área bajo la curva es el desplazamiento: rectángulos, triángulos y trapecios. El área bajo el eje cuenta negativa (el móvil regresa). Calcula Δx y pulsa Enter para ver el área pintarse.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta Δx de 5 en 5 m" },
    { teclas: ["⏎"], texto: "¡corre! y se pinta el área" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/5/examen", titulo: "Etapa 5.4 · Examen" },
  descRondas: {
    guiado: "El área ya está sombreada y la tecla que brilla te guía.",
    pista: "Divide la figura en rectángulos y triángulos.",
    solo: "Solo la gráfica. Calcula el área y corre.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };
const PASO = 5;
const INICIO = 10;

export default function EtapaArea() {
  const motor = useEtapa<ProblemaArea>({ clave: "n5-area", rondas: RONDAS_AREA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", dx: INICIO });
  const dx = st.clave === clave ? st.dx : INICIO;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, dx: Math.max(-50, Math.min(150, dx + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const correr = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = () => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (Math.abs(dx - p.respuesta) < 1e-6) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: p.respuesta === 0 ? "¡Exacto! Avanza y regresa lo mismo: Δx = 0." : `¡Exacto! El área bajo v–t es Δx = ${fmtNum(p.respuesta)} m.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El auto se desplazó ${fmtNum(p.respuesta)} m; tú pusiste ${dx} m.` });
    }
  };

  const pedirPista = () => {
    if (!motor.pedirPista(2)) return;
    setFb({ clave, tipo: "info", texto: p.pistas[motor.pistas] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowUp") { e.preventDefault(); cambiar(PASO); }
    else if (e.key === "ArrowDown") { e.preventDefault(); cambiar(-PASO); }
    else if (e.key === "Enter") correr();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (dx < p.respuesta ? "↑" : dx > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_GRAFICA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGrafica
            T={p.T}
            paneles={[{ eje: "v", yMin: p.vMin, yMax: p.vMax, series: [{ puntos: p.puntos, color: VERDE }], area: { puntos: p.puntos, t1: p.T, siempre: guiado } }]}
            pista={{ xMin: p.xMin, xMax: p.xMax, x: (t) => integrar(p.puntos, t) }}
            lectura={(t) => `Δx = ${fmtNum(integrar(p.puntos, Math.min(t, p.T)))} m`}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaGrafica T={it.T} paneles={[{ eje: "v", yMin: it.vMin, yMax: it.vMax, series: [{ puntos: it.puntos, color: VERDE }] }]} previa={rol === "siguiente" ? "área" : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">¿Cuánto se desplaza el móvil entre t = 0 y t = {p.T} s?</p>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="m">{F_AREA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-PASO)} disabled={!motor.jugando}>
            − Δx
          </button>
          <button className="btn" onClick={() => cambiar(PASO)} disabled={!motor.jugando}>
            + Δx
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
          simbolo="Δx"
          valor={String(dx)}
          unidad="m"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(PASO)} aria-label="Subir Δx">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-PASO)} aria-label="Bajar Δx">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_VALOR} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GRAFICA, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta Δx · Enter para correr</span>}
    />
  );
}
