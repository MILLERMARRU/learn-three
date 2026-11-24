// ══ Etapa 17.2 · Campo eléctrico: la flecha del campo en P debe crecer hasta la fantasma propuesta ───────
import { useState } from "react";
import { E_MAX, E_MIN, F_CAMPO, RONDAS_CAMPO, type ProblemaCampo } from "@/contenido/nivel-17/campo";
import { fmtQ } from "@/contenido/nivel-17/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaCampo } from "@/three/electro/EscenaCampo";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_ELECTRO, ESCENARIO_CAMPO, simularTecla, teclasElectro, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "17.2",
  titulo: "Campo eléctrico",
  nivel: "Electrostática",
  nivelNum: 17,
  siguiente: { ruta: "/nivel/17/potencial", titulo: "Etapa 17.3 · Potencial eléctrico" },
  intro: (
    <>
      Una carga crea a su alrededor un <b>campo eléctrico</b>: la fuerza que sentiría cada coulomb puesto allí. Para una carga puntual, <b>E = k·Q/d²</b>; apunta hacia afuera si Q es positiva y hacia la carga si es negativa. Con varias cargas, los campos se <b>suman como vectores</b>. Propón E en el punto P (en 10⁵ N/C): la flecha debe crecer hasta tu fantasma azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡activa! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Una carga: a 30 cm, E (×10⁵) vale lo mismo que Q (μC). La tecla que brilla te guía.",
    pista: "Otras distancias: el campo cae con d².",
    solo: "Dos cargas: suma o resta sus campos según el sentido.",
  },
};

const textoCorto = (p: ProblemaCampo) => (p.cargas.length === 1 ? `${fmtQ(p.cargas[0].q)} · ${p.cargas[0].d} cm` : "dos cargas");

/** La cuenta: una carga, «E = 9×10⁹·4×10⁻⁶/0,3² = 4 × 10⁵ N/C»; dos, con sus componentes. */
function cuenta(p: ProblemaCampo): string {
  if (p.cargas.length === 1) {
    const c = p.cargas[0];
    return `E = 9×10⁹ · ${Math.abs(c.q)}×10⁻⁶ / ${String(c.d / 100).replace(".", ",")}² = ${p.respuesta} × 10⁵ N/C`;
  }
  const [a, b] = p.componentes.map((x) => Math.abs(x));
  const mismo = Math.sign(p.componentes[0]) === Math.sign(p.componentes[1]);
  return `E₁ = ${a} y E₂ = ${b} → E = ${mismo ? `${a} + ${b}` : `${Math.max(a, b)} − ${Math.min(a, b)}`} = ${p.respuesta} × 10⁵ N/C`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaCampo() {
  const motor = useEtapa<ProblemaCampo>({ clave: "n17-campo", rondas: RONDAS_CAMPO, avanceMs: 1900 });
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
    setSt({ clave, v: Math.max(E_MIN, Math.min(E_MAX, v + d)) });
    sfx.tecla();
    if (retro && retro.tipo !== "ok") setFb(null);
  };

  const activar = () => {
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
      setFb({ clave, tipo: "ok", texto: `¡La flecha llegó a tu fantasma! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `La flecha se quedó corta: el campo en P es menor que ${v} × 10⁵ N/C.` : `La flecha pasó tu fantasma: el campo en P es mayor que ${v} × 10⁵ N/C.` });
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
    } else if (e.key === "Enter") activar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;
  const textos = (q: ProblemaCampo) => q.cargas.map((c, i) => `${q.cargas.length === 2 ? `q${i === 0 ? "₁" : "₂"} = ` : "Q = "}${fmtQ(c.q)}`);

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_ELECTRO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaCampo cargas={p.cargas} E={p.respuesta} sentido={p.sentido} Epropuesto={v} textos={textos(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaCampo cargas={it.cargas} E={it.respuesta} sentido={it.sentido} Epropuesto={null} textos={[]} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.cargas.length === 1 ? (
      <>
        ¿Qué campo eléctrico crea una carga de <b>{fmtQ(p.cargas[0].q)}</b> en un punto P a <b>{p.cargas[0].d} cm</b>?
      </>
    ) : (
      <>
        En la recta que une <b>{fmtQ(p.cargas[0].q)}</b> y <b>{fmtQ(p.cargas[1].q)}</b>, el punto P está a <b>{p.cargas[0].d} cm</b> de la primera y a <b>{p.cargas[1].d} cm</b> de la segunda. ¿Cuánto vale el campo en P?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.cargas.map((c, i) => (
          <span key={i} className="var-chip">
            <V>{p.cargas.length === 1 ? "Q" : i === 0 ? "q₁" : "q₂"}</V> <b>{fmtQ(c.q)}</b> · <b>{c.d} cm</b>
          </span>
        ))}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_CAMPO}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          <button className="btn btn-pri" onClick={activar} disabled={!motor.jugando || corriendo}>
            ¡Activa!
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
          simbolo="E"
          valor={String(v)}
          unidad="× 10⁵ N/C"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el campo">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el campo">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasElectro("¡activa!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_CAMPO, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 · ← → de 10 · Enter para activar el campo</span>}
    />
  );
}
