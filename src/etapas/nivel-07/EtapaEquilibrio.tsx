// ══ Etapa 7.1 · Primera condición de equilibrio: ajusta la fuerza que falta para que ΣF = 0 y el cuerpo quede en reposo ───────
import { useState, type ReactNode } from "react";
import { direccionLibre, escalaFuerzas, F_EQUILIBRIO, F_MAX, F_MIN, F_PASO, fuerzasDe, nombreFuerza, RONDAS_EQUILIBRIO, type ProblemaEquilibrio } from "@/contenido/nivel-07/equilibrio";
import { modulo, sumar } from "@/lib/estatica";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaFuerzas } from "@/three/estatica/EscenaFuerzas";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_FUERZAS, ESCENARIO_FUERZAS, fmtNum, simularTecla, TECLAS_FUERZA, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "7.1",
  titulo: "Primera condición de equilibrio",
  nivel: "Estática",
  nivelNum: 7,
  intro: (
    <>
      Un cuerpo está en <b>equilibrio</b> cuando las fuerzas que actúan sobre él se anulan: <b>ΣF = 0</b>, o sea ΣFx = 0 y ΣFy = 0. Si sobra o falta fuerza, la resultante lo pone en movimiento. Ajusta la fuerza que falta y suelta el cuerpo: el <b>polígono de fuerzas</b> debe cerrarse.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "sube o baja la fuerza (5 N)" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/7/aparejo", titulo: "Etapa 7.2 · Poleas fijas y móviles" },
  descRondas: {
    guiado: "La flecha roja es la resultante: llévala a cero. La tecla que brilla te guía.",
    pista: "Descompón las fuerzas en x e y; cada suma debe dar cero.",
    solo: "Sin resultante a la vista: calcula, ajusta y suelta.",
  },
};

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

const CUERPO: Record<ProblemaEquilibrio["tipo"], string> = { colgado: "bloque", piso: "bloque", plano: "bloque", cuerdas: "nudo" };

function enunciado(p: ProblemaEquilibrio): ReactNode {
  const inc = <b>{nombreFuerza(p.incognita)}</b>;
  if (p.tipo === "colgado") {
    return (
      <>
        Un bloque de <b>{p.m !== null ? `${p.m} kg` : `${p.W} N`}</b> cuelga en reposo de una cuerda. ¿Cuál es la tensión {inc} de la cuerda?
      </>
    );
  }
  if (p.tipo === "plano") {
    return (
      <>
        Un bloque de <b>{p.W} N</b> se sostiene en un plano liso inclinado <b>{p.angulo}°</b> con una cuerda paralela al plano. ¿Cuál es la tensión {inc}?
      </>
    );
  }
  if (p.tipo === "cuerdas") {
    const ang = p.incognita === "T1" ? p.angulo : p.angulo2;
    return (
      <>
        Una lámpara de <b>{p.W} N</b> cuelga de dos cuerdas que forman <b>{p.angulo}°</b> y <b>{p.angulo2}°</b> con el techo. ¿Cuál es la tensión {inc} (la cuerda de {ang}°)?
      </>
    );
  }
  return (
    <>
      Una caja de <b>{p.W} N</b> está en reposo sobre el piso. Se tira de ella con <b>{p.F} N</b> formando <b>{p.angulo}°</b> con la horizontal. ¿Cuánto vale {p.incognita === "f" ? "el rozamiento" : "la normal"} {inc}?
    </>
  );
}

function chips(p: ProblemaEquilibrio): [ReactNode, string][] {
  const peso: [ReactNode, string] = p.m !== null ? [<V key="m">m</V>, `${p.m} kg`] : [<V key="w">W</V>, `${p.W} N`];
  if (p.tipo === "colgado") return [peso, [<V key="g">g</V>, "10 m/s²"]];
  if (p.tipo === "plano") return [peso, [<V key="t">θ</V>, `${p.angulo}°`]];
  if (p.tipo === "cuerdas") return [peso, [<V key="a">α</V>, `${p.angulo}°`], [<V key="b">β</V>, `${p.angulo2}°`]];
  return [peso, [<V key="f">F</V>, `${p.F} N`], [<V key="t">θ</V>, `${p.angulo}°`]];
}

const textoCorto = (p: ProblemaEquilibrio) => ({ colgado: `colgado · ${p.W} N`, piso: `piso · ${p.F} N a ${p.angulo}°`, plano: `plano de ${p.angulo}°`, cuerdas: `lámpara · ${p.angulo}° y ${p.angulo2}°` })[p.tipo];

/** Hacia dónde apunta la resultante, en palabras. */
function haciaDonde(p: ProblemaEquilibrio, rx: number, ry: number): string {
  if (p.tipo === "plano") return (rx * Math.cos((p.angulo * Math.PI) / 180) + ry * Math.sin((p.angulo * Math.PI) / 180) > 0 ? "sube por el plano" : "baja por el plano");
  const h = Math.abs(rx) > 1e-6 ? (rx > 0 ? "a la derecha" : "a la izquierda") : "";
  const v = Math.abs(ry) > 1e-6 ? (ry > 0 ? "hacia arriba" : "hacia abajo") : "";
  return `se mueve ${[v, h].filter(Boolean).join(" y ")}`;
}


export default function EtapaEquilibrio() {
  const motor = useEtapa<ProblemaEquilibrio>({ clave: "n7-equilibrio", rondas: RONDAS_EQUILIBRIO, avanceMs: 1900 });
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
  const fuerzas = fuerzasDe(p, v);
  const nombre = nombreFuerza(p.incognita);

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

  const alTerminar = ({ equilibrio }: { equilibrio: boolean }) => {
    setCorrida((c) => (c ? { ...c, fin: true } : c));
    if (!motor.jugando) return;
    if (equilibrio && v === p.respuesta) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡Equilibrio! Con ${nombre} = ${v} N la resultante es cero y el ${CUERPO[p.tipo]} queda en reposo.` });
    } else {
      motor.error();
      const [rx, ry] = sumar(fuerzas.map((f) => f.vec));
      setFb({ clave, tipo: "mal", texto: `ΣF = ${fmtNum(modulo([rx, ry]))} N: el ${CUERPO[p.tipo]} ${haciaDonde(p, rx, ry)}. ${v > p.respuesta ? `Sobra fuerza: baja ${nombre}.` : `Falta fuerza: sube ${nombre}.`}` });
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
          <EscenaFuerzas
            tipo={p.tipo}
            angulo={p.angulo}
            angulo2={p.angulo2}
            fuerzas={fuerzas}
            libre={direccionLibre(p)}
            escala={escalaFuerzas(p)}
            verResultante={guiado || !!enCurso?.fin}
            corrida={enCurso ? { id: enCurso.id } : null}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaFuerzas tipo={it.tipo} angulo={it.angulo} angulo2={it.angulo2} fuerzas={fuerzasDe(it, it.respuesta)} libre={direccionLibre(it)} escala={escalaFuerzas(it)} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado(p)}</p>
      <div className="variables" key={clave}>
        {chips(p).map(([s, val], i) => (
          <span className="var-chip" key={i}>
            {s} <b>{val}</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_EQUILIBRIO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-F_PASO)} disabled={!motor.jugando}>
            − {nombre}
          </button>
          <button className="btn" onClick={() => cambiar(F_PASO)} disabled={!motor.jugando}>
            + {nombre}
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
          simbolo={nombre}
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
