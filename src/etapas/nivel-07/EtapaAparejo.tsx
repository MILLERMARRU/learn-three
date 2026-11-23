// ══ Etapa 7.2 · Poleas fijas y móviles: ajusta la fuerza con la que se tira de la cuerda para sostener el peso ───────
import { useState } from "react";
import { F_MAX, F_MIN, F_PASO } from "@/contenido/nivel-07/equilibrio";
import { F_APAREJO, F_APAREJO_PESO, RONDAS_APAREJO, type ProblemaAparejo } from "@/contenido/nivel-07/poleas";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaAparejo } from "@/three/estatica/EscenaAparejo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_FUERZAS, ESCENARIO_FUERZAS, simularTecla, TECLAS_FUERZA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "7.2",
  titulo: "Poleas fijas y móviles",
  nivel: "Estática",
  nivelNum: 7,
  intro: (
    <>
      La <b>polea fija</b> solo cambia la dirección de la fuerza: F = W. La <b>polea móvil</b> cuelga de dos tramos de cuerda y cada uno sostiene la mitad: F = W/2. Con <b>n</b> poleas móviles en cascada, <b>F = W/2ⁿ</b> (a cambio, la mano recorre 2ⁿ veces más cuerda). Ajusta la fuerza y suelta.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la fuerza (5 N)" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/7/momento", titulo: "Etapa 7.3 · Momento de una fuerza" },
  descRondas: {
    guiado: "Cuenta los tramos de cuerda que sostienen la polea móvil. La tecla que brilla te guía.",
    pista: "Cada polea móvil divide la fuerza entre dos.",
    solo: "Ahora las poleas también pesan: súmalo a la carga.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const montaje = (p: ProblemaAparejo) => (p.moviles === 0 ? "una polea fija" : p.moviles === 1 ? "una polea móvil (y una fija para tirar hacia abajo)" : `un aparejo de ${p.moviles} poleas móviles`);
const textoCorto = (p: ProblemaAparejo) => (p.moviles === 0 ? `polea fija · ${p.W} N` : `${p.moviles} móvil${p.moviles > 1 ? "es" : ""} · ${p.W} N`);

export default function EtapaAparejo() {
  const motor = useEtapa<ProblemaAparejo>({ clave: "n7-aparejo", rondas: RONDAS_APAREJO, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: F_MIN });
  const v = st.clave === clave ? st.v : F_MIN;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const factor = 2 ** p.moviles;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(F_MIN, Math.min(F_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const soltar = () => {
    if (!motor.jugando || corriendo) return;
    setCorrida({ clave, id: performance.now(), fin: false });
    setFb(null);
    sfx.seleccion();
  };

  const alTerminar = ({ equilibrio, sube }: { equilibrio: boolean; sube: boolean }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    const carga = p.P > 0 ? `W + P = ${p.W + p.P} N` : `W = ${p.W} N`;
    if (equilibrio) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Equilibrio! ${factor === 1 ? `F = ${v} N = W` : `${factor} · F = ${factor} · ${v} = ${factor * v} N sostiene ${carga}`}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `Con F = ${v} N el peso ${sube ? "sube: sobra fuerza, bájala" : "baja: falta fuerza, súbela"}. Recuerda: ${carga}${factor > 1 ? ` se reparte entre ${factor}` : ""}.` });
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
      cambiar(F_PASO);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(-F_PASO);
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (v < p.respuesta ? "↑" : v > p.respuesta ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_FUERZAS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaAparejo moviles={p.moviles} W={p.W} P={p.P} F={v} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaAparejo moviles={it.moviles} W={it.W} P={it.P} F={it.respuesta} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">
        Un peso de <b>{p.W} N</b> se sostiene con {montaje(p)}
        {p.P > 0 && (
          <>
            ; la polea móvil pesa <b>{p.P} N</b>
          </>
        )}
        . ¿Con qué fuerza hay que tirar de la cuerda para que quede en reposo?
      </p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>W</V> <b>{p.W} N</b>
        </span>
        <span className="var-chip">
          <V>n</V> <b>{p.moviles} móviles</b>
        </span>
        {p.P > 0 && (
          <span className="var-chip">
            <V>P</V> <b>{p.P} N</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{p.P > 0 ? F_APAREJO_PESO : F_APAREJO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-F_PASO)} disabled={!motor.jugando}>
            − F
          </button>
          <button className="btn" onClick={() => cambiar(F_PASO)} disabled={!motor.jugando}>
            + F
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
          simbolo="F"
          valor={String(v)}
          unidad="N"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(F_PASO)} aria-label="Subir la fuerza">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-F_PASO)} aria-label="Bajar la fuerza">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_FUERZA} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_FUERZAS, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta la fuerza · Enter para soltar</span>}
    />
  );
}
