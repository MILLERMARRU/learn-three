// ══ Etapa 9.2 · Gravedad en la altura y en otros planetas: propone g y una bola fantasma cae junto a la real ───────
import { useState } from "react";
import { F_GRAVEDAD, G10_MAX, G10_MIN, RONDAS_GRAVEDAD, type ProblemaGravedad } from "@/contenido/nivel-09/gravedad";
import { R_TIERRA } from "@/lib/gravitacion";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { EscenaGravedad, textoAltura } from "@/three/gravitacion/EscenaGravedad";
import { CascaronEtapa, descRonda, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { Formula, V } from "@/ui/Formula";
import { TecladoVirtual, type DecoTecla } from "@/ui/TecladoVirtual";
import { CARRUSEL_GRAVITACION, ESCENARIO_GRAVEDAD, fmtNum, fraccion, simularTecla, ValorTexto } from "./comun";

const META: MetaEtapa = {
  numero: "9.2",
  titulo: "Gravedad en la altura y en otros planetas",
  nivel: "Gravitación universal",
  nivelNum: 9,
  intro: (
    <>
      La gravedad de un planeta es <b>g = GM/r²</b>, con r la distancia al centro. Al subir, r = R + h crece y g baja con su cuadrado; en otro planeta, g cambia con su masa y con el cuadrado de su radio. En la Tierra, <b>g₀ = 10 m/s²</b> y R = 6400 km. Propón g: una <b>bola fantasma</b> caerá con ella junto a la real.
    </>
  ),
  como: [
    { teclas: ["↑", "↓"], texto: "ajusta g de 0,1 en 0,1" },
    { teclas: ["←", "→"], texto: "de 1 en 1 m/s²" },
    { teclas: ["⏎"], texto: "¡suelta! y se comprueba" },
    { teclas: ["H"], texto: "pista" },
  ],
  descRondas: {
    guiado: "Sobre la Tierra, a una altura h. La tecla que brilla te guía.",
    pista: "En la superficie de otros planetas.",
    solo: "Otro planeta y además a una altura.",
  },
};

const TECLAS_G: Record<string, DecoTecla> = {
  "↑": { sub: "+0,1" },
  "↓": { sub: "−0,1" },
  "→": { sub: "+1" },
  "←": { sub: "−1" },
  intro: { sub: "¡suelta!" },
  h: { sub: "pista" },
};

const MASA: Record<string, string> = {
  "2": "el doble de la masa",
  "4": "4 veces la masa",
  "8": "8 veces la masa",
  "16": "16 veces la masa",
  "0.5": "la mitad de la masa",
  "0.1": "la décima parte de la masa",
};
const RADIO: Record<string, string> = { "1": "el mismo radio", "2": "el doble de su radio", "0.5": "la mitad de su radio" };
const ALTURA: Record<string, string> = { "1": "igual a su radio", "0.25": "igual a la cuarta parte de su radio" };

const tierra = (p: ProblemaGravedad) => p.kM === 1 && p.kR === 1;
const km = (hR: number) => `${(hR * R_TIERRA).toLocaleString("es")} km`;

/** R / (R + h) como fracción: h = R → «1/2», h = R/4 → «4/5». */
function razon(hR: number): string {
  for (let q = 1; q <= 8; q++) {
    const pq = hR * q;
    if (Math.abs(pq - Math.round(pq)) < 1e-9) return `${q}/${q + Math.round(pq)}`;
  }
  return fmtNum(1 / (1 + hR), 3);
}

/** La cuenta completa: «g = 10 · 8 / 2² · (1/2)² = 5 m/s²». */
function cuenta(p: ProblemaGravedad): string {
  const kR = fraccion(p.kR);
  const masa = p.kM === 1 ? "" : ` · ${fmtNum(p.kM, 2)}`;
  const radio = p.kR === 1 ? "" : ` / ${Number.isInteger(p.kR) ? kR : `(${kR})`}²`;
  const altura = p.hR > 0 ? ` · (${razon(p.hR)})²` : "";
  return `g = 10${masa}${radio}${altura} = ${fmtNum(p.respuesta, 2)} m/s²`;
}

const textoCorto = (p: ProblemaGravedad) => (tierra(p) ? textoAltura(p.hR) : `${fmtNum(p.kM, 2)}M₀ · ${fmtNum(p.kR, 2)}R₀`);

type Retro = { clave: string; tipo: "ok" | "mal" | "info"; texto: string };

export default function EtapaGravedad() {
  const motor = useEtapa<ProblemaGravedad>({ clave: "n9-gravedad", rondas: RONDAS_GRAVEDAD, avanceMs: 1900 });
  const p = motor.item;
  const clave = `${motor.r}-${p.id}`;
  const guiado = motor.ronda === "guiado";
  // en décimas de m/s²; se parte de la gravedad terrestre
  const [st, setSt] = useState({ clave: "", v10: 100 });
  const v10 = st.clave === clave ? st.v10 : 100;
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
    setSt({ clave, v10: Math.max(G10_MIN, Math.min(G10_MAX, v10 + d)) });
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
      setFb({ clave, tipo: "ok", texto: `¡Caen juntas! ${cuenta(p)}.` });
    } else {
      motor.error();
      setFb({ clave, tipo: "mal", texto: `La bola fantasma ${v10 > r10 ? "llegó antes" : "se quedó atrás"}: la gravedad real es ${v10 > r10 ? "menor" : "mayor"} que ${fmtNum(v, 2)} m/s².` });
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
      {...CARRUSEL_GRAVITACION}
      render={(it, rol) =>
        rol === "actual" ? (
          <EscenaGravedad kM={p.kM} kR={p.kR} hR={p.hR} gReal={p.respuesta} gFantasma={v} verValor={exito} corrida={enCurso ? { id: enCurso.id } : null} onFin={alTerminar} exito={exito} />
        ) : (
          <EscenaGravedad kM={it.kM} kR={it.kR} hR={it.hR} gReal={it.respuesta} gFantasma={null} previa={rol === "siguiente" ? textoCorto(it) : ""} />
        )
      }
    />
  );

  const enunciado = tierra(p) ? (
    <>
      En la superficie terrestre g₀ = 10 m/s². ¿Cuánto vale la gravedad a <b>{km(p.hR)}</b> de altura? (R = 6400 km)
    </>
  ) : (
    <>
      Un planeta tiene <b>{MASA[String(p.kM)]}</b> de la Tierra y <b>{RADIO[String(p.kR)]}</b>. ¿Cuánto vale la gravedad {p.hR > 0 ? <>a una altura <b>{ALTURA[String(p.hR)]}</b></> : "en su superficie"}? (En la Tierra, g₀ = 10 m/s²)
    </>
  );

  const panel = (
    <>
      <p className="pregunta">{enunciado}</p>
      <div className="variables" key={clave}>
        {tierra(p) ? (
          <>
            <span className="var-chip">
              <V>g</V>₀ <b>10 m/s²</b>
            </span>
            <span className="var-chip">
              <V>R</V> <b>6400 km</b>
            </span>
          </>
        ) : (
          <>
            <span className="var-chip">
              <V>M</V> <b>{fmtNum(p.kM, 2)}M₀</b>
            </span>
            <span className="var-chip">
              <V>R</V> <b>{fmtNum(p.kR, 2)}R₀</b>
            </span>
          </>
        )}
        {p.hR > 0 && (
          <span className="var-chip">
            <b>{textoAltura(p.hR)}</b>
          </span>
        )}
      </div>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>{verFormula ? <Formula tam="l">{F_GRAVEDAD}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}</div>
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
          simbolo="g"
          valor={fmtNum(v, 2)}
          unidad="m/s²"
          ok={exito}
          mal={retro?.tipo === "mal"}
          extra={
            <span className="ajuste">
              <button className="slot-arr" onClick={() => cambiar(1)} aria-label="Subir la gravedad">
                ▲
              </button>
              <button className="slot-arr" onClick={() => cambiar(-1)} aria-label="Bajar la gravedad">
                ▼
              </button>
            </span>
          }
        />
      }
      teclado={<TecladoVirtual activas={TECLAS_G} siguiente={siguienteTecla} onTecla={simularTecla} flechas />}
      escenario={{ ...ESCENARIO_GRAVEDAD, vista: clave }}
      pieEscena={<span>↑ ↓ de 0,1 · ← → de 1 m/s² · Enter para soltar</span>}
    />
  );
}
