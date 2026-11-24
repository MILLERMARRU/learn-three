// ══ Etapa 10.2 · Conservación de la energía mecánica: rapidez abajo (fantasma) o altura máxima (bandera) en una pista lisa ───────
import { useState } from "react";
import { E_MAX, E_MIN, F_ENERGIA, RONDAS_ENERGIA, type ProblemaEnergia } from "@/contenido/nivel-10/energia";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaPista } from "@/three/energia/EscenaPista";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_ENERGIA, ESCENARIO_PISTA_E, fmtNum, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "10.2",
  titulo: "Conservación de la energía mecánica",
  nivel: "Trabajo, energía y potencia",
  nivelNum: 10,
  intro: (
    <>
      Sin rozamiento, la <b>energía mecánica se conserva</b>: lo que el carrito pierde de energía potencial (mgh) lo gana en cinética (½mv²) y al revés. Mira las barras <b>Ec</b> y <b>Ep</b>: cambian, pero su suma no. Predice la rapidez (un <b>carrito fantasma</b> sale con ella) o la altura que alcanza (pon la <b>bandera</b>).
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Baja desde el reposo: rapidez abajo. La tecla que brilla te guía.",
    pista: "Sube con una rapidez: ¿hasta qué altura llega?",
    solo: "Rapidez inicial, alturas intermedias y de todo un poco.",
  },
};

const TECLAS_E: Record<string, DecoTecla> = {
  "↑": { sub: "+1" },
  "↓": { sub: "−1" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

/** La cuenta: «v² = 36 + 2·10·3,2 = 100 → v = 10 m/s» o «h = 3 + 100/20 = 8 m». */
function cuenta(p: ProblemaEnergia): string {
  if (p.tipo === "h") return p.h1 > 0 ? `h = ${fmtNum(p.h1, 1)} + ${p.v0}²/20 = ${p.respuesta} m` : `h = ${p.v0}²/20 = ${p.respuesta} m`;
  const baja = fmtNum(p.h1 - p.h2, 1);
  return `v² = ${p.v0 > 0 ? `${p.v0}² + ` : ""}2·10·${baja} = ${p.respuesta ** 2} → v = ${p.respuesta} m/s`;
}

const textoCorto = (p: ProblemaEnergia) => (p.tipo === "v" ? `h₁ = ${fmtNum(p.h1, 1)} m` : `v₀ = ${p.v0} m/s`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaEnergia() {
  const motor = useEtapa<ProblemaEnergia>({ clave: "n10-energia", rondas: RONDAS_ENERGIA, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const inicial = p.tipo === "v" ? p.v0 : Math.round(p.h1);
  const [st, setSt] = useState({ clave: "", v: 0 });
  const v = st.clave === clave ? st.v : inicial;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;
  const unidad = p.tipo === "v" ? "m/s" : "m";

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(E_MIN, Math.min(E_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `${p.tipo === "v" ? "¡Van juntos!" : "¡Justo en la bandera!"} ${cuenta(p)}.` });
    } else {
      motor.error();
      const texto =
        p.tipo === "v"
          ? `El fantasma ${v > p.respuesta ? "se adelantó" : "se quedó atrás"}: la rapidez real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m/s.`
          : `El carrito se detuvo ${v > p.respuesta ? "por debajo" : "por encima"} de la bandera: la altura real es ${v > p.respuesta ? "menor" : "mayor"} que ${v} m.`;
      setFb({ clave, tipo: "mal", texto });
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
      {...CARRUSEL_ENERGIA}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaPista tipo={p.tipo} h1={p.h1} v0={p.v0} h2={p.h2} real={p.respuesta} propuesta={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaPista tipo={it.tipo} h1={it.h1} v0={it.v0} h2={it.h2} real={it.respuesta} propuesta={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const salida =
    p.h1 > 0 ? (
      <>
        desde <b>{fmtNum(p.h1, 1)} m</b> de altura{p.v0 > 0 ? <> con <b>{p.v0} m/s</b></> : " desde el reposo"}
      </>
    ) : (
      <>
        desde abajo con <b>{p.v0} m/s</b>
      </>
    );
  const enunciado =
    p.tipo === "v" ? (
      <>
        Un carrito parte {salida} por una pista sin rozamiento. ¿Con qué rapidez pasa {p.h2 > 0 ? <>por la altura de <b>{fmtNum(p.h2, 1)} m</b></> : "por la parte más baja"}?
      </>
    ) : (
      <>
        Un carrito parte {salida} por una pista sin rozamiento. ¿Hasta qué altura sube en la rampa?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>h</V>₁ <b>{fmtNum(p.h1, 1)} m</b>
        </span>
        <span className="var-chip">
          <V>v</V>₀ <b>{p.v0} m/s</b>
        </span>
        {p.tipo === "v" && p.h2 > 0 && (
          <span className="var-chip">
            <V>h</V>₂ <b>{fmtNum(p.h2, 1)} m</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_ENERGIA}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            − 1
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            + 1
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
          simbolo={p.tipo === "v" ? "v" : "h"}
          valor={String(v)}
          unidad={unidad}
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
      teclado={<TecladoVirtual activas={TECLAS_E} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_PISTA_E, vista: clave }}
      pieEscena={<span>↑ ↓ ajusta el valor · Enter para soltar</span>}
    />
  );
}
