// ══ Etapa 12.1 · Sistema masa-resorte: predice el período y un oscilador fantasma oscila junto al real ───────
import { useState } from "react";
import { F_RESORTE, fmtT, RONDAS_RESORTE, T10_MAX, T10_MIN, type ProblemaResorte } from "@/contenido/nivel-12/resorte";
import { periodoResorte } from "@/lib/oscilaciones";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaResorte } from "@/three/oscilaciones/EscenaResorte";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_OSCILACIONES, ESCENARIO_RESORTE, fmtNum, simularTecla, TECLAS_T, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "12.1",
  titulo: "Sistema masa-resorte",
  nivel: "Oscilaciones (MAS)",
  nivelNum: 12,
  intro: (
    <>
      Un bloque unido a un resorte va y viene alrededor de su posición de equilibrio: es un <b>movimiento armónico simple</b>. El tiempo de una oscilación completa es el <b>período: T = 2π√(m/k)</b>; no depende de cuánto lo estires. Usa <b>π² ≈ 10</b>, así T = 2√(10·m/k). Propón el período: un <b>bloque fantasma</b> oscilará con él junto al real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta T de 0,1 en 0,1 s" },
    { teclas: ["←", "→"], texto: "de 1 en 1 s" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Período directo. La tecla que brilla te guía.",
    pista: "¿Qué pasa si cambias la masa o el resorte?",
    solo: "Fracciones y decimales; la fórmula se oculta.",
  },
};

/** «multiplica por 4», «divide entre 4». */
const cambio = (n: number, b: number) => (n > b ? `se multiplica por ${fmtNum(n / b, 2)}` : `se divide entre ${fmtNum(b / n, 2)}`);

/** La cuenta: «T = 2√(10·1/10) = 2 s». */
function cuenta(p: ProblemaResorte): string {
  return `T = 2√(10·${fmtNum(p.m, 2)}/${fmtNum(p.k, 1)}) = ${fmtT(p.respuesta)} s`;
}

const textoCorto = (p: ProblemaResorte) => `${fmtNum(p.m, 2)} kg · ${p.k} N/m`;

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaResorte() {
  const motor = useEtapa<ProblemaResorte>({ clave: "n12-resorte", rondas: RONDAS_RESORTE, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // en décimas de segundo; se parte de 1 s (o del período conocido)
  const inicial = p.base ? Math.round(periodoResorte(p.base.m, p.base.k) * 10) : 10;
  const [st, setSt] = useState({ clave: "", v10: 10 });
  const v10 = st.clave === clave ? st.v10 : inicial;
  const v = v10 / 10;
  const r10 = Math.round(p.respuesta * 10);
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v10: Math.max(T10_MIN, Math.min(T10_MAX, v10 + d)) });
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
    if (v10 === r10) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: `¡En fase! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `El fantasma oscila más ${v10 > r10 ? "lento" : "rápido"}: el período real es ${v10 > r10 ? "menor" : "mayor"} que ${fmtT(v)} s.` });
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
    } else if (e.key === "Enter") soltar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const falta = r10 - v10;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_OSCILACIONES}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaResorte m={p.m} k={p.k} T={p.respuesta} Tfantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaResorte m={it.m} k={it.k} T={it.respuesta} Tfantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = p.base ? (
    <>
      Un bloque de {fmtNum(p.base.m, 2)} kg unido a un resorte de {p.base.k} N/m oscila con período <b>{fmtT(periodoResorte(p.base.m, p.base.k))} s</b>. Si {p.m !== p.base.m ? <>la masa {cambio(p.m, p.base.m)}</> : <>la constante del resorte {cambio(p.k, p.base.k)}</>}, ¿cuál es el nuevo período?
    </>
  ) : (
    <>
      Un bloque de <b>{fmtNum(p.m, 2)} kg</b> oscila unido a un resorte de <b>{p.k} N/m</b> sobre un piso liso. ¿Cuál es su período? (π² ≈ 10)
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>m</V> <b>{fmtNum(p.m, 2)} kg</b>
        </span>
        <span className="var-chip">
          <V>k</V> <b>{p.k} N/m</b>
        </span>
        <span className="var-chip">
          π² <b>≈ 10</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_RESORTE}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={() => cambiar(-10)} disabled={!motor.jugando}>
            −1
          </button>
          <button className="btn" onClick={() => cambiar(-1)} disabled={!motor.jugando}>
            −0,1
          </button>
          <button className="btn" onClick={() => cambiar(1)} disabled={!motor.jugando}>
            +0,1
          </button>
          <button className="btn" onClick={() => cambiar(10)} disabled={!motor.jugando}>
            +1
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
          simbolo="T"
          valor={fmtT(v)}
          unidad="s"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el período">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el período">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_T} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_RESORTE, vista: clave }}
      pieEscena={<span>↑ ↓ de 0,1 s · ← → de 1 s · Enter para soltar</span>}
    />
  );
}
