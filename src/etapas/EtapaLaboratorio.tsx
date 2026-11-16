// ══ Etapa 1.3 · Laboratorio de fórmulas: ajusta exponentes con las flechas hasta cuadrar el sistema ───────
import { useEffect, useState } from "react";
import { RONDAS_LAB, type Laboratorio } from "@/contenido/nivel-01/laboratorio";
import { BASES, fraccion, INFO_BASE, formato, type Base } from "@/lib/dim";
import { emitirPolvo } from "@/lib/polvo";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { Caida } from "@/three/escenas/Caida";
import { Circular } from "@/three/escenas/Circular";
import { Onda } from "@/three/escenas/Onda";
import { Pendulo } from "@/three/escenas/Pendulo";
import { CarruselItems } from "@/three/CarruselItems";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, Op, V } from "@/ui/Formula";
import { normalTecla, TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";

const META: MetaEtapa = {
  numero: "1.3",
  titulo: "Laboratorio de fórmulas",
  nivel: "Análisis dimensional",
  nivelNum: 1,
  intro: (
    <>
      Si una magnitud depende de otras, su fórmula tiene la forma <b>k · Aˣ · Bʸ · Cᶻ</b>. Experimenta con el aparato 3D y ajusta los exponentes hasta que cada fila del sistema (M, L, T) cuadre.
    </>
  ),
  como: [
    { teclas: ["←", "→"], texto: "elige un exponente" },
    { teclas: ["↑", "↓"], texto: "súbelo o bájalo de ½ en ½" },
    { teclas: ["−", "+", "M"], texto: "manipula el experimento" },
    { teclas: ["⏎"], texto: "comprueba la fórmula" },
  ],
  siguiente: { ruta: "/nivel/1/examen", titulo: "Etapa 1.4 · Examen" },
  descRondas: {
    guiado: "El sistema te guía: el exponente que parpadea es el siguiente que debes ajustar.",
    pista: "Ves el sistema y qué filas cuadran, pero tú decides qué exponente mover.",
    solo: "Sistema oculto: experimenta, razona y comprueba. Cada pista cuesta.",
  },
};

const MIN = -3;
const MAX = 3;

interface Fila {
  base: Base;
  simbolico: string;
  izq: number;
  der: number;
  ok: boolean;
}

function filasDe(lab: Laboratorio, exps: number[]): Fila[] {
  const usadas = BASES.filter((b) => lab.resultado.dim[b] || lab.variables.some((v) => v.dim[b]));
  return usadas.map((b) => {
    const coefs = lab.variables.map((v) => v.dim[b] ?? 0);
    const terminos = coefs
      .map((c, i) => (c ? { c, e: lab.variables[i].exp } : null))
      .filter((x): x is { c: number; e: string } => !!x);
    const simbolico =
      terminos
        .map((t, i) => {
          const signo = t.c < 0 ? (i === 0 ? "−" : " − ") : i === 0 ? "" : " + ";
          const a = Math.abs(t.c);
          return `${signo}${a === 1 ? "" : a}${t.e}`;
        })
        .join("") || "0";
    const izq = coefs.reduce((s, c, i) => s + c * exps[i], 0);
    const der = lab.resultado.dim[b] ?? 0;
    return { base: b, simbolico, izq, der, ok: Math.abs(izq - der) < 1e-9 };
  });
}

type Retroalimentacion = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaLaboratorio() {
  const motor = useEtapa<Laboratorio>({ clave: "n1-laboratorio", rondas: RONDAS_LAB, avanceMs: 2600 });
  const lab = motor.item;
  const clave = `${motor.r}-${lab.id}`;
  const [st, setSt] = useState({ clave: "", exps: [] as number[], sel: 0 });
  const exps = st.clave === clave ? st.exps : lab.variables.map(() => 0);
  const sel = st.clave === clave ? st.sel : 0;
  const [fb, setFb] = useState<Retroalimentacion | null>(null);
  const retro = fb?.clave === clave ? fb : null;

  const guiado = motor.ronda === "guiado";
  const filas = filasDe(lab, exps);
  const verSistema = motor.ronda !== "solo" || motor.pistas >= 1;
  const verChecks = motor.ronda !== "solo";
  const sugerido = guiado ? exps.findIndex((e, i) => e !== lab.respuesta[i]) : -1;

  const poner = (nExps: number[], nSel: number) => setSt({ clave, exps: nExps, sel: nSel });
  const cambiar = (i: number, d: number) => {
    if (!motor.jugando) return;
    const n = [...exps];
    n[i] = Math.max(MIN, Math.min(MAX, n[i] + d));
    poner(n, i);
    sfx.tecla();
    if (retro?.tipo !== "ok") setFb(null);
  };

  const comprobar = () => {
    if (!motor.jugando) return;
    const ok = exps.every((e, i) => Math.abs(e - lab.respuesta[i]) < 1e-9);
    if (ok) {
      motor.acierto();
      setFb({ clave, tipo: "ok", texto: "¡La fórmula cuadra en todas las filas!" });
      return;
    }
    motor.error();
    const mala = filas.find((f) => !f.ok);
    setFb({
      clave,
      tipo: "mal",
      texto: motor.ronda === "solo" ? "Todavía no cuadra. Pide una pista (H) para ver el sistema." : mala ? `La fila ${mala.base} no cuadra: ${mala.simbolico} debe dar ${fraccion(mala.der)}.` : "Revisa los exponentes.",
    });
  };

  const pedirPista = () => {
    if (!motor.pedirPista(3)) return;
    const n = motor.pistas + 1;
    if (n >= 3) {
      // tercera pista: corrige el primer exponente equivocado
      const i = exps.findIndex((e, k) => e !== lab.respuesta[k]);
      if (i >= 0) {
        const nx = [...exps];
        nx[i] = lab.respuesta[i];
        poner(nx, i);
        setFb({ clave, tipo: "info", texto: `Te doy uno: ${lab.variables[i].exp} = ${fraccion(lab.respuesta[i])}.` });
      }
      return;
    }
    setFb({ clave, tipo: "info", texto: n === 1 ? (motor.ronda === "solo" ? `Sistema visible. ${lab.pistas[0]}` : lab.pistas[0]) : lab.pistas[1] });
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      poner(exps, (sel - 1 + exps.length) % exps.length);
      sfx.seleccion();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      poner(exps, (sel + 1) % exps.length);
      sfx.seleccion();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cambiar(sel, 0.5);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cambiar(sel, -0.5);
    } else if (e.key === "Enter") comprobar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") pedirPista();
  });

  const exito = motor.fase === "exito";
  const ESCENAS = { pendulo: Pendulo, caida: Caida, circular: Circular, onda: Onda };
  // carrusel: el experimento actual al centro y el siguiente esperando a la derecha (sin teclas ni etiquetas)
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={7.5}
      render={(x, rol) => {
        const E = ESCENAS[x.escena];
        return <E exito={rol === "actual" && exito} activo={rol === "actual"} />;
      }}
    />
  );

  // teclado virtual: flechas para los exponentes y las teclas del experimento
  const teclasLab: Record<string, DecoTecla> = { "←": {}, "→": {}, "↑": {}, "↓": {}, intro: { sub: "comprobar" }, h: { sub: "pista" } };
  for (const c of lab.controles) {
    for (const k of c.teclas) teclasLab[normalTecla(k === "−" ? "-" : k)] = { sub: c.texto, color: "#d9c3a0" };
  }
  // en la ronda guiada brilla la tecla que conviene pulsar
  let siguienteTecla: string | null = null;
  if (guiado && motor.jugando && sugerido >= 0) {
    if (sel !== sugerido) siguienteTecla = sugerido > sel ? "→" : "←";
    else siguienteTecla = exps[sel] < lab.respuesta[sel] ? "↑" : "↓";
  } else if (guiado && motor.jugando && sugerido < 0) siguienteTecla = "intro";
  // una tecla virtual se comporta igual que una física (también la recibe el experimento 3D)
  const simularTecla = (k: string) => {
    const mapa: Record<string, string> = { "←": "ArrowLeft", "→": "ArrowRight", "↑": "ArrowUp", "↓": "ArrowDown", intro: "Enter" };
    window.dispatchEvent(new KeyboardEvent("keydown", { key: mapa[k] ?? k }));
  };

  // celebración: una nube de polvo dorado alrededor del experimento
  useEffect(() => {
    if (!exito) return;
    emitirPolvo({ pos: [0, 0.4, 0], color: "#d9c3a0", n: 320, radio: 1.4, fuerza: 1.5, vida: 2.4 });
    emitirPolvo({ pos: [0, 0.4, 0], color: "#8fdcaa", n: 140, radio: 0.8, fuerza: 1.1 });
  }, [exito]);

  // la fórmula con los exponentes va al centro, entre la escena y el teclado
  const formula = (
      <div className={`formula-lab ${exito ? "rc-ok" : ""} ${retro?.tipo === "mal" ? "sacudir" : ""}`} key={`f${motor.faseId}`}>
        <Formula tam="xl">
          <V>{lab.resultado.s}</V>
          <Op>=</Op>
          <V>k</V>
          {lab.variables.map((v, i) => (
            <span key={v.s} className="lab-factor">
              <Op>·</Op>
              <V>{v.s}</V>
              <button
                className={`slot ${i === sel ? "slot-sel" : ""} ${i === sugerido ? "slot-sug" : ""} ${verChecks && exps[i] === lab.respuesta[i] && guiado ? "slot-ok" : ""}`}
                onClick={() => poner(exps, i)}
                aria-label={`Exponente ${v.exp}`}
              >
                <span className="slot-arr" onClick={(e) => (e.stopPropagation(), cambiar(i, 0.5))}>▲</span>
                <span className="slot-val">{fraccion(exps[i])}</span>
                <span className="slot-arr" onClick={(e) => (e.stopPropagation(), cambiar(i, -0.5))}>▼</span>
                <span className="slot-nom">{v.exp}</span>
              </button>
            </span>
          ))}
        </Formula>
      </div>
  );

  const panel = (
    <>
      <p className="pregunta">{lab.descripcion}</p>
      <h1 className="palabra palabra-m" key={clave}>
        {lab.titulo}
      </h1>
      <div className="variables">
        <span className="var-chip">
          <V>{lab.resultado.s}</V> {lab.resultado.nombre} <b>{formato(lab.resultado.dim)}</b>
        </span>
        {lab.variables.map((v) => (
          <span key={v.s} className="var-chip">
            <V>{v.s}</V> {v.nombre} <b>{formato(v.dim)}</b>
          </span>
        ))}
      </div>
      <div className={`sistema ${verSistema ? "" : "oculto"}`}>
        <div className="sistema-tit">Sistema de ecuaciones · iguala exponentes</div>
        {verSistema ? (
          filas.map((f) => (
            <div key={f.base} className={`fila ${verChecks ? (f.ok ? "fila-ok" : "fila-mal") : ""}`}>
              <span className="fila-base" style={{ color: INFO_BASE[f.base].color }}>
                {f.base}
              </span>
              <span className="fila-eq">
                {f.simbolico} = {fraccion(f.der)}
              </span>
              <span className="fila-val">
                {fraccion(f.izq)} {verChecks ? (f.ok ? "✓" : "✗") : ""}
              </span>
            </div>
          ))
        ) : (
          <div className="fila fila-oculta">Oculto en la ronda Solo · pulsa H para verlo</div>
        )}
      </div>
      <p className="experimento">
        <span className="kicker">Experimenta</span> {lab.experimento}
      </p>
      <p className="hud-ayuda">
        {descRonda(META, motor.ronda)} <span className="hud-pistas">Pistas {motor.pistas}/3</span>
      </p>
      {/* en móvil no hay teclado: botones */}
      <div className="solo-movil">
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 3}>
            Pista <span className="btn-meta">{motor.pistas}/3</span>
          </button>
          <button className="btn btn-pri" onClick={comprobar} disabled={!motor.jugando}>
            Comprobar
          </button>
        </div>
      </div>
    </>
  );

  // al acertar, la fórmula descubierta aparece encima de la respuesta
  const retroNodo = exito ? (
    <RetroLinea tipo="ok">
      Fórmula descubierta: <Formula tam="m">{lab.final}</Formula>
    </RetroLinea>
  ) : retro ? (
    <RetroLinea tipo={retro.tipo}>{retro.texto}</RetroLinea>
  ) : null;

  return (
    <CascaronEtapa
      retro={retroNodo}
      meta={META}
      motor={motor}
      escena={escena}
      panel={panel}
      respuesta={formula}
      teclado={<TecladoVirtual activas={teclasLab} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ encuadre: { w: 6.4, h: 5.2 }, balanceo: 0.12, vista: clave }}
      pieEscena={
        <span>
          {lab.controles.map((c, i) => (
            <span key={i} className="pie-ctrl">
              {c.teclas.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}{" "}
              {c.texto}
            </span>
          ))}
          <span className="pie-ctrl">arrastra para girar</span>
        </span>
      }
    />
  );
}
