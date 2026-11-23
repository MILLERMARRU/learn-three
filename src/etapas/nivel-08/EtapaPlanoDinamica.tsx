// ══ Etapa 8.2 · Plano inclinado con rozamiento: propone la aceleración y compara un fantasma con el bloque real ───────
import { useState } from "react";
import { A_MAX, A_MIN, F_PLANO_D, LARGO_PLANO, RONDAS_PLANO_D, type ProblemaPlanoD } from "@/contenido/nivel-08/plano";
import { senCos } from "@/lib/estatica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPlanoD } from "@/three/dinamica/EscenaPlanoD";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_DINAMICA, ESCENARIO_PLANO, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "8.2",
  titulo: "Plano inclinado con rozamiento",
  nivel: "Dinámica",
  nivelNum: 8,
  intro: (
    <>
      Un bloque baja solo por un plano inclinado. Lo acelera la componente del peso a lo largo del plano (mg sen θ) y lo frena el rozamiento (μ·mg cos θ): <b>a = g(sen θ − μ cos θ)</b>. ¡La masa se simplifica! Propón la aceleración: un <b>bloque fantasma</b> bajará con ella junto al real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la aceleración (1 m/s²)" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Sin rozamiento: a = g sen θ. La tecla que brilla te guía.",
    pista: "Con rozamiento: resta μ cos θ al seno.",
    solo: "Ojo: si μ alcanza a tan θ, el bloque ni se mueve.",
  },
};

const TECLAS_ACEL: Record<string, DecoTecla> = {
  "↑": { sub: "+1 m/s²" },
  "↓": { sub: "−1 m/s²" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const textoCorto = (p: ProblemaPlanoD) => `${p.theta}°${p.mu > 0 ? ` · μ = ${fmtNum(p.mu, 3)}` : " · liso"}`;

export default function EtapaPlanoDinamica() {
  const motor = useEtapa<ProblemaPlanoD>({ clave: "n8-plano", rondas: RONDAS_PLANO_D, avanceMs: 1900 });
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

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(A_MIN, Math.min(A_MAX, v + d)) });
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
    const [s, c] = senCos(p.theta);
    const cuenta = p.mu > 0 ? `a = 10(${fmtNum(s, 3)} − ${fmtNum(p.mu, 3)} · ${fmtNum(c, 3)}) = ${p.respuesta} m/s²` : `a = 10 · ${fmtNum(s, 3)} = ${p.respuesta} m/s²`;
    if (v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: p.respuesta === 0 ? `¡Bien! El rozamiento lo sostiene: ${cuenta}, no baja.` : `¡Bajan juntos! ${cuenta}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El fantasma ${v > p.respuesta ? "se adelantó" : "se quedó atrás"}: la aceleración real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m/s².` });
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

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_DINAMICA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPlanoD theta={p.theta} mu={p.mu} largo={LARGO_PLANO} aFantasma={v} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPlanoD theta={it.theta} mu={it.mu} largo={LARGO_PLANO} aFantasma={it.respuesta} conFantasma={false} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        Un bloque de <b>{p.m} kg</b> se suelta en un plano inclinado <b>{p.theta}°</b> {p.mu > 0 ? <>con rozamiento (μ = {fmtNum(p.mu, 3)})</> : "liso"}. ¿Con qué aceleración baja?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>θ</V> <b>{p.theta}°</b>
        </span>
        <span className="var-chip">
          <V>μ</V> <b>{fmtNum(p.mu, 3)}</b>
        </span>
        <span className="var-chip">
          <V>m</V> <b>{p.m} kg</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_PLANO_D}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − a
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + a
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
          simbolo="a"
          valor={String(v)}
          unidad="m/s²"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la aceleración">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la aceleración">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_ACEL} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PLANO, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la aceleración · Enter para soltar</span>}
    />
  );
}
