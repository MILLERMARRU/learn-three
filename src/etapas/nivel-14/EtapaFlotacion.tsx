// ══ Etapa 14.3 · Principio de Arquímedes: el bloque debe asentarse a la profundidad propuesta ───────
import { useState } from "react";
import { F_FLOTACION, H_MAX, H_MIN, MATERIALES, RONDAS_FLOTACION, type ProblemaFlotacion } from "@/contenido/nivel-14/flotacion";
import { fmtF, LIQUIDOS } from "@/contenido/nivel-14/modelo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaFlotacion } from "@/three/fluidos/EscenaFlotacion";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_FLUIDOS, ESCENARIO_FLOTACION, simularTecla, TECLAS_FLUIDO, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "14.3",
  titulo: "Principio de Arquímedes",
  nivel: "Hidrostática",
  nivelNum: 14,
  intro: (
    <>
      Todo cuerpo sumergido recibe un empuje hacia arriba igual al <b>peso del líquido que desaloja</b>: es el <b>principio de Arquímedes</b>, E = ρ<sub>l</sub>·g·V<sub>sum</sub>. Un bloque flota cuando se hunde lo justo para que el empuje iguale su peso: la parte sumergida es <b>h = H·ρ<sub>c</sub>/ρ<sub>l</sub></b>. Propón cuánto se hunde: el fantasma azul flotará a tu profundidad y el bloque real caerá al líquido.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 cm" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡suelta el bloque! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  siguiente: { ruta: "/nivel/14/examen", titulo: "Etapa 14.4 · Examen tipo admisión" },
  descRondas: {
    guiado: "Bloques en agua: h = H·ρc/1000. La tecla que brilla te guía.",
    pista: "Otros líquidos: aceite, mercurio y glicerina.",
    solo: "Cubos con su masa: primero calcula la densidad.",
  },
};

const textoBloque = (p: ProblemaFlotacion) => (p.masa !== undefined ? `cubo · ${fmtF(p.masa)} kg` : `${MATERIALES[p.material].nombre} · ${p.rhoC} kg/m³`);
const textoLiquido = (p: ProblemaFlotacion) => `${LIQUIDOS[p.liquido].nombre} · ρ = ${LIQUIDOS[p.liquido].rho} kg/m³`;
const textoCorto = (p: ProblemaFlotacion) => `${p.masa !== undefined ? "cubo" : MATERIALES[p.material].nombre} en ${LIQUIDOS[p.liquido].nombre}`;

/** La cuenta de la respuesta («h = 20·600/1000 = 12 cm»; en los cubos, con la densidad primero). */
function cuenta(p: ProblemaFlotacion): string {
  const rl = LIQUIDOS[p.liquido].rho;
  if (p.masa !== undefined) return `ρ = ${fmtF(p.masa)}/${fmtF(p.H / 100)}³ → h = ${p.H}·ρ/${rl} = ${p.respuesta} cm`;
  return `h = ${p.H}·${p.rhoC}/${rl} = ${p.respuesta} cm`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaFlotacion() {
  const motor = useEtapa<ProblemaFlotacion>({ clave: "n14-flotacion", rondas: RONDAS_FLOTACION, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 5 });
  const v = st.clave === clave ? st.v : 5;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(H_MIN, Math.min(H_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡Se asentó justo en tu línea! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `El bloque se hundió menos: ${v} cm es demasiado.` : `El bloque se hundió más: ${v} cm se queda corto.` });
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
  const falta = p.respuesta - v;
  const siguienteTecla = guiado && motor.jugando && !corriendo ? (falta >= 10 ? "→" : falta <= -10 ? "←" : falta > 0 ? "↑" : falta < 0 ? "↓" : "intro") : null;

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_FLUIDOS}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaFlotacion
            colorLiquido={LIQUIDOS[p.liquido].color}
            colorBloque={MATERIALES[p.material].color}
            H={p.H}
            h={p.respuesta}
            hPropuesta={v}
            textoBloque={textoBloque(p)}
            textoLiquido={textoLiquido(p)}
            verValor={exito}
            corrida={enCurso ? { id: enCurso.id } : null}
            moviendo={corriendo}
            onFin={alTerminar}
            exito={exito}
          />
        ) : (
          <EscenaFlotacion colorLiquido={LIQUIDOS[it.liquido].color} colorBloque={MATERIALES[it.material].color} H={it.H} h={it.respuesta} hPropuesta={null} textoBloque="" textoLiquido="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const liq = LIQUIDOS[p.liquido];
  const enunciado =
    p.masa !== undefined ? (
      <>
        Un cubo de <b>{p.H} cm</b> de arista y <b>{fmtF(p.masa)} kg</b> flota en <b>{liq.nombre}</b> (ρ = {liq.rho} kg/m³). ¿Cuántos centímetros se hunde?
      </>
    ) : (
      <>
        Un bloque de <b>{MATERIALES[p.material].nombre}</b> (ρ = {p.rhoC} kg/m³) de <b>{p.H} cm</b> de alto flota en <b>{liq.nombre}</b> (ρ = {liq.rho} kg/m³). ¿Cuántos centímetros se hunde?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {p.masa !== undefined ? (
          <>
            <span className="var-chip">
              <V>L</V> <b>{p.H} cm</b>
            </span>
            <span className="var-chip">
              <V>m</V> <b>{fmtF(p.masa)} kg</b>
            </span>
          </>
        ) : (
          <>
            <span className="var-chip">
              <V>H</V> <b>{p.H} cm</b>
            </span>
            <span className="var-chip">
              <V>ρc</V> <b>{p.rhoC} kg/m³</b>
            </span>
          </>
        )}
        <span className="var-chip">
          <V>ρl</V> <b>{liq.rho} kg/m³</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_FLOTACION}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="h"
          valor={String(v)}
          unidad="cm"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Hundir más">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Hundir menos">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_FLUIDO} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_FLOTACION, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 cm · ← → de 10 · Enter para soltar el bloque</span>}
    />
  );
}
