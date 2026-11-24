// ══ Etapa 16.1 · Gases ideales: el pistón debe detenerse en el volumen propuesto ───────
import { useState } from "react";
import { F_GAS, fmtT, RONDAS_GAS, V_MAX, V_MIN, type ProblemaGas } from "@/contenido/nivel-16/gas";
import { kelvin } from "@/lib/termo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGas } from "@/three/termo/EscenaGas";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual } from "@/ui/TecladoVirtual";
import { CARRUSEL_TERMO, ESCENARIO_GAS, simularTecla, teclasTermo, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "16.1",
  titulo: "Gases ideales",
  nivel: "Termodinámica",
  nivelNum: 16,
  siguiente: { ruta: "/nivel/16/trabajo", titulo: "Etapa 16.2 · Trabajo de un gas" },
  intro: (
    <>
      Un gas ideal cumple <b>P·V/T = constante</b>, con T en kelvin (T = t + 273). A temperatura constante, P y V son inversos (<b>Boyle</b>); a presión constante, V crece con T (<b>Charles</b>). En el cilindro, cada pesa sobre el pistón es 1 atm y el mechero calienta o enfría el gas. Propón el volumen final: el pistón debe detenerse en tu aro azul.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta de 1 en 1 L" },
    { teclas: ["←", "→"], texto: "de 10 en 10" },
    { teclas: ["⏎"], texto: "¡cambia! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Temperatura constante: P₁V₁ = P₂V₂. La tecla que brilla te guía.",
    pista: "Presión constante: V/T constante, con T en kelvin.",
    solo: "Cambian P y T a la vez: P₁V₁/T₁ = P₂V₂/T₂.",
  },
};

const textoP = (p: ProblemaGas) => (p.P1 === p.P2 ? `P = ${p.P1} atm` : `P: ${p.P1} → ${p.P2} atm`);
const textoT = (p: ProblemaGas) => (p.t1 === p.t2 ? `T constante · ${fmtT(p.t1)} °C` : `${fmtT(p.t1)} °C → ${fmtT(p.t2)} °C`);
const textoCorto = (p: ProblemaGas) => ({ isotermico: "T constante", isobarico: "P constante", general: "cambian P y T" })[p.proceso];

/** La cuenta: «V₂ = 10·(2/4)·(300/300) = 5 L». */
function cuenta(p: ProblemaGas): string {
  const T1 = kelvin(p.t1);
  const T2 = kelvin(p.t2);
  if (p.proceso === "isotermico") return `V₂ = ${p.P1}·${p.V1}/${p.P2} = ${p.respuesta} L`;
  if (p.proceso === "isobarico") return `V₂ = ${p.V1}·${T2}/${T1} = ${p.respuesta} L`;
  return `V₂ = ${p.V1}·(${p.P1}/${p.P2})·(${T2}/${T1}) = ${p.respuesta} L`;
}

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaGas() {
  const motor = useEtapa<ProblemaGas>({ clave: "n16-gas", rondas: RONDAS_GAS, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  const [st, setSt] = useState({ clave: "", v: 1 });
  const v = st.clave === clave ? st.v : p.V1;
  const [corrida, setCorrida] = useState<{ clave: string; id: number; fin: boolean } | null>(null);
  const enCurso = corrida?.clave === clave ? corrida : null;
  const corriendo = !!enCurso && !enCurso.fin;
  const [fb, setFb] = useState<Retro | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const verFormula = motor.ronda !== "solo" || motor.pistas >= 1;

  const cambiar = (d: number) => {
    if (!motor.jugando || corriendo) return;
    if (enCurso) setCorrida(null);
    setSt({ clave, v: Math.max(V_MIN, Math.min(V_MAX, v + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡El pistón se detuvo en tu aro! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: v > p.respuesta ? `El pistón quedó por debajo de tu aro: el volumen final es menor que ${v} L.` : `El pistón quedó por encima de tu aro: el volumen final es mayor que ${v} L.` });
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

  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      {...CARRUSEL_TERMO}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGas P1={p.P1} P2={p.P2} V1={p.V1} V2={p.respuesta} Vpropuesto={v} T1={kelvin(p.t1)} T2={kelvin(p.t2)} textoP={textoP(p)} textoT={textoT(p)} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaGas P1={it.P1} P2={it.P2} V1={it.V1} V2={it.respuesta} Vpropuesto={null} T1={kelvin(it.t1)} T2={kelvin(it.t2)} textoP="" textoT="" previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado =
    p.proceso === "isotermico" ? (
      <>
        Un gas ocupa <b>{p.V1} L</b> a <b>{p.P1} atm</b>. Sin cambiar su temperatura, la presión pasa a <b>{p.P2} atm</b>. ¿Qué volumen ocupa?
      </>
    ) : p.proceso === "isobarico" ? (
      <>
        Un gas ocupa <b>{p.V1} L</b> a <b>{fmtT(p.t1)} °C</b>. A presión constante, su temperatura pasa a <b>{fmtT(p.t2)} °C</b>. ¿Qué volumen ocupa?
      </>
    ) : (
      <>
        Un gas ocupa <b>{p.V1} L</b> a <b>{p.P1} atm</b> y <b>{fmtT(p.t1)} °C</b>. Pasa a <b>{p.P2} atm</b> y <b>{fmtT(p.t2)} °C</b>. ¿Qué volumen ocupa?
      </>
    );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        <span className="var-chip">
          <V>V₁</V> <b>{p.V1} L</b>
        </span>
        <span className="var-chip">
          <V>P</V> <b>{p.P1 === p.P2 ? `${p.P1}` : `${p.P1} → ${p.P2}`} atm</b>
        </span>
        <span className="var-chip">
          <V>t</V> <b>{p.t1 === p.t2 ? fmtT(p.t1) : `${fmtT(p.t1)} → ${fmtT(p.t2)}`} °C</b>
        </span>
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_GAS}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
            ¡Cambia!
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
          simbolo="V₂"
          valor={String(v)}
          unidad="L"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir el volumen">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar el volumen">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={teclasTermo("¡cambia!")} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GAS, vista: clave }}
      pieEscena={<span>↑ ↓ de 1 L · ← → de 10 · Enter para cambiar el estado del gas</span>}
    />
  );
}
