// ══ Etapa 15.1 · Dilatación térmica: el extremo libre de la barra debe llegar a la marca propuesta ───────
import { useState } from "react";
import { D_MAX, D_MIN, F_DILATACION, fmtC, METALES, RONDAS_DILATACION, type ProblemaDilatacion } from "@/contenido/nivel-15/dilatacion";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaDilatacion } from "@/three/calor/EscenaDilatacion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_CALOR, ESCENARIO_DILATACION, simularTecla, teclasCalor, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "15.1",
  titulo: "Dilatación térmica",
  nivel: "Calor",
  nivelNum: 15,
  intro: (
    <>
      Al calentarse, los átomos de un sólido vibran más y se separan: el cuerpo se <b>dilata</b>. En una barra, el alargamiento es <b>ΔL = L₀·α·ΔT</b>, donde α es el coeficiente de dilatación lineal del material. Si se enfría, ΔT es negativo y se acorta. Propón cuántos milímetros cambia: el extremo libre debe llegar a tu marca azul (el cambio se dibuja muy exagerado).
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 mm" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡calienta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Rieles de acero: ΔL = L₀·α·ΔT. La tecla que brilla te guía.",
    pista: "Otros metales: calcula ΔT con las temperaturas.",
    solo: "Barras que se enfrían: ¿cuánto se acortan?",
  },
};

const enfria = (p: ProblemaDilatacion) => p.T1 < p.T0;
const textoTemp = (p: ProblemaDilatacion) => (p.conTemps ? `${fmtC(p.T0)} °C → ${fmtC(p.T1)} °C` : `ΔT = ${p.T1 - p.T0} °C`);
const textoCorto = (p: ProblemaDilatacion) => `${METALES[p.metal].nombre} · ${fmtC(p.L0)} m`;

/** La cuenta: «ΔL = 10 000·12×10⁻⁶·50 = 6 mm». */
function cuenta(p: ProblemaDilatacion): string {
  const dT = Math.abs(p.T1 - p.T0);
  return `ΔL = ${String(p.L0 * 1000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} mm · ${METALES[p.metal].texto} · ${dT} = ${p.respuesta} mm`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaDilatacion() {
  const motor = useEtapa<ProblemaDilatacion>({ clave: "n15-dilatacion", rondas: RONDAS_DILATACION, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const frio = enfria(p);
  const [st, setSt] = useState({ clave: "", v: 1 });
  const v = st.clave === clave ? st.v : 1;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(D_MIN, Math.min(D_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const iniciar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡El extremo llegó a tu marca! ${cuenta(p)}.` });
    } else {
      motor.error();
      const corto = v > p.respuesta;
      setFb({ clave, tipo: "mal", texto: `La barra ${frio ? "se acortó" : "se alargó"} ${corto ? "menos" : "más"} que tu marca: el cambio real es ${corto ? "menor" : "mayor"} que ${v} mm.` });
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
    } else if (e.key === "Enter") iniciar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const met = METALES[p.metal];

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_CALOR}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaDilatacion colorMetal={met.color} dL={p.respuesta} dLpropuesto={v} enfria={frio} textoBarra={`${met.nombre} · L₀ = ${fmtC(p.L0)} m`} textoTemp={textoTemp(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaDilatacion colorMetal={METALES[it.metal].color} dL={it.respuesta} dLpropuesto={null} enfria={enfria(it)} textoBarra="" textoTemp="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = p.conTemps ? (
    <>
      Una barra de <b>{met.nombre}</b> de <b>{fmtC(p.L0)} m</b> pasa de <b>{fmtC(p.T0)} °C</b> a <b>{fmtC(p.T1)} °C</b>. ¿Cuántos milímetros se {frio ? "acorta" : "alarga"}?
    </>
  ) : (
    <>
      Un riel de <b>{met.nombre}</b> de <b>{fmtC(p.L0)} m</b> se calienta <b>{p.T1 - p.T0} °C</b>. ¿Cuántos milímetros se alarga?
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>L₀</V> <b>{fmtC(p.L0)} m</b>
        </span>
        <span className="var-chip">
          <V>α</V> <b>{met.texto} /°C</b>
        </span>
        <span className="var-chip">
          <V>ΔT</V> <b>{p.conTemps ? "?" : `${p.T1 - p.T0} °C`}</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_DILATACION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={iniciar} disabled={!motor.jugando || corriendo}>
            {frio ? "¡Enfría!" : "¡Calienta!"}
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
          simbolo="ΔL"
          valor={String(v)}
          unidad="mm"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el cambio de longitud">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el cambio de longitud">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasCalor(frio ? "¡enfría!" : "¡calienta!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_DILATACION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 mm · ← → de 10 · Enter para {frio ? "enfriar" : "calentar"}</span>}
    />
  );
}
