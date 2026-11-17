// ══ Inicio: una sola pantalla (sin scroll) con el hero 3D y el carrusel de niveles → etapas ───────
import { useState } from "react";
import { ETAPAS_POR_NIVEL, NIVELES_FISICA, OTROS_CURSOS, TEASERS, siguienteEtapa, type EtapaInfo } from "@/contenido/curso";
import { INFO_BASE } from "@/lib/dim";
import { useProgreso, type Progreso } from "@/lib/progreso";
import { navegar } from "@/lib/ruta";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { BarraSuperior } from "@/ui/BarraSuperior";
import { Estrellas } from "@/ui/Estrellas";
import { Carrusel } from "./Carrusel";
import { HeroNivel } from "./hero/HeroNivel";

type Modo = "niveles" | "etapas";
const disponible = (i: number) => !!ETAPAS_POR_NIVEL[i + 1];
const pad = (n: number) => String(n).padStart(2, "0");

export function Mapa() {
  const prog = useProgreso();
  const sig = siguienteEtapa((c) => !!prog[c]);
  const empezado = Object.keys(prog).length > 0;
  const [modo, setModo] = useState<Modo>("niveles");
  const [nivel, setNivel] = useState(sig.nivel - 1);
  const [etapa, setEtapa] = useState(0);
  const etapas = ETAPAS_POR_NIVEL[nivel + 1] ?? [];
  const n = nivel + 1;

  const total = modo === "niveles" ? NIVELES_FISICA.length : etapas.length;
  const actual = modo === "niveles" ? nivel : etapa;
  const setActual = modo === "niveles" ? setNivel : setEtapa;

  const mover = (d: number) => {
    const k = Math.max(0, Math.min(total - 1, actual + d));
    if (k !== actual) {
      setActual(k);
      sfx.seleccion();
    }
  };
  const entrarNivel = (i: number) => {
    if (!disponible(i)) return;
    const es = ETAPAS_POR_NIVEL[i + 1];
    const primera = es.findIndex((e) => !prog[e.clave]);
    setNivel(i);
    setEtapa(primera >= 0 ? primera : 0);
    setModo("etapas");
    sfx.ronda();
  };
  const volver = () => {
    setModo("niveles");
    sfx.seleccion();
  };
  const jugar = (nv: number, e: EtapaInfo) => navegar(`/nivel/${nv}/${e.id}`);

  useTeclas((e) => {
    if (e.key === "ArrowRight") mover(1);
    else if (e.key === "ArrowLeft") mover(-1);
    else if (e.key === "Enter") {
      if (modo === "niveles") entrarNivel(nivel);
      else jugar(n, etapas[etapa]);
    } else if ((e.key === "Escape" || e.key === "Backspace") && modo === "etapas") volver();
  });

  const sugerida = etapas.find((e) => !prog[e.clave]);

  return (
    <div className="inicio">
      <BarraSuperior />
      <main className="inicio-main">
        <section className="inicio-hero">
          <div className="hero-texto">
            <div className="kicker">Física preuniversitaria · gratis · sin cuenta</div>
            <h1 className="hero-titulo">
              Aprende física <em>moviéndola.</em>
            </h1>
            <p className="hero-lead">Cada tema es un nivel. Escribes, arrastras y experimentas en 3D, y la teoría aparece justo cuando la necesitas.</p>
            <button className="btn btn-pri btn-l" onClick={() => jugar(sig.nivel, sig.etapa)}>
              {empezado ? "Continuar" : "Empezar"} · {sig.etapa.numero} {sig.etapa.titulo}
            </button>
          </div>
          <HeroNivel nivel={nivel} />
        </section>

        <section className="carrusel-sec">
          <div className="carrusel-cab">
            {modo === "niveles" ? (
              <div className="cursos-tabs">
                <span className="curso-tab on">Física</span>
                {OTROS_CURSOS.map((c) => (
                  <span key={c} className="curso-tab" title="Próximamente">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <div className="carrusel-migas">
                <button className="btn" onClick={volver}>
                  ← Niveles <kbd>Esc</kbd>
                </button>
                <span className="cm-titulo">
                  <b>Nivel {pad(n)}</b> · {NIVELES_FISICA[nivel]} · elige una etapa
                </span>
              </div>
            )}
            <div className="carrusel-nav">
              <span className="cn-cont">
                <b>{modo === "niveles" ? pad(actual + 1) : etapas[actual]?.numero}</b> / {modo === "niveles" ? total : `${n}.${total}`}
              </span>
              <button className="cn-btn" onClick={() => mover(-1)} disabled={actual === 0} aria-label="Anterior">
                ←
              </button>
              <button className="cn-btn" onClick={() => mover(1)} disabled={actual === total - 1} aria-label="Siguiente">
                →
              </button>
            </div>
          </div>

          {modo === "niveles" ? (
            <Carrusel
              key="niveles"
              items={NIVELES_FISICA}
              actual={nivel}
              setActual={setNivel}
              clave={(t) => t}
              clase={(_, i) => (disponible(i) ? "" : "nc-bloqueada")}
              onElegir={entrarNivel}
              render={(titulo, i, activa) => <TarjetaNivel titulo={titulo} i={i} activa={activa} prog={prog} onEtapa={(e) => jugar(i + 1, e)} />}
            />
          ) : (
            <Carrusel
              key={`etapas-${n}`}
              items={etapas}
              actual={etapa}
              setActual={setEtapa}
              clave={(e) => e.id}
              clase={(e) => (prog[e.clave] ? "nc-hecha" : e.id === sugerida?.id ? "nc-sugerida" : "")}
              onElegir={(i) => jugar(n, etapas[i])}
              paso={320}
              render={(e, _i, activa) => <TarjetaEtapa e={e} prog={prog} activa={activa} sugerida={e.id === sugerida?.id} />}
            />
          )}
        </section>
      </main>
    </div>
  );
}

// ══ Tarjetas ───────
function TarjetaNivel({ titulo, i, activa, prog, onEtapa }: { titulo: string; i: number; activa: boolean; prog: Progreso; onEtapa: (e: EtapaInfo) => void }) {
  const etapas = ETAPAS_POR_NIVEL[i + 1];
  const estrellas = etapas ? etapas.reduce((s, e) => s + (prog[e.clave]?.estrellas ?? 0), 0) : 0;
  return (
    <>
      <div className="nc-cab">
        <span className="nc-num">{pad(i + 1)}</span>
        <span className={`chip ${etapas ? "chip-on" : ""}`}>{etapas ? "disponible" : "pronto"}</span>
      </div>
      <h3 className="nc-titulo">{titulo}</h3>
      <p className="nc-teaser">{TEASERS[i] ?? "Próximamente."}</p>
      {etapas ? (
        <>
          <div className="nc-etapas">
            {etapas.map((e) => (
              <button
                key={e.id}
                className={`nc-etapa ${prog[e.clave] ? "hecha" : ""}`}
                onClick={(ev) => {
                  // en una tarjeta lateral el clic solo la trae al centro
                  if (!activa) return;
                  ev.stopPropagation();
                  onEtapa(e);
                }}
                tabIndex={activa ? 0 : -1}
              >
                <span>{e.numero}</span> {e.titulo}
                <Estrellas n={prog[e.clave]?.estrellas ?? 0} />
              </button>
            ))}
          </div>
          <div className="nc-pie">
            <span className="nc-est">
              ★ {estrellas}/{etapas.length * 3}
            </span>
            <span className="btn btn-pri nc-jugar">
              Ver etapas <kbd>⏎</kbd>
            </span>
          </div>
        </>
      ) : (
        <div className="nc-pie">
          <span className="nc-candado">Se desbloquea al terminar el nivel {pad(i)}</span>
        </div>
      )}
    </>
  );
}

function TarjetaEtapa({ e, prog, activa, sugerida }: { e: EtapaInfo; prog: Progreso; activa: boolean; sugerida: boolean }) {
  const p = prog[e.clave];
  return (
    <>
      <div className="nc-cab">
        <span className="nc-num">{e.numero}</span>
        <span className={`chip ${sugerida ? "chip-on" : ""}`}>{sugerida ? "sigue esta" : e.tipo}</span>
      </div>
      <h3 className="nc-titulo">{e.titulo}</h3>
      <p className="nc-teaser">{e.resumen}</p>
      <div className="ec-visual">
        <VisualEtapa id={e.id} />
      </div>
      <div className="nc-pie">
        <Estrellas n={p?.estrellas ?? 0} />
        {activa && (
          <span className="btn btn-pri nc-jugar">
            {p ? "Repetir" : "Jugar"} <kbd>⏎</kbd>
          </span>
        )}
      </div>
    </>
  );
}

// pequeño dibujo de cada mecánica
function VisualEtapa({ id }: { id: string }) {
  if (id === "moleculas") {
    return (
      <span className="ev-dim">
        <b style={{ color: INFO_BASE.M.color }}>M</b>
        <b style={{ color: INFO_BASE.L.color }}>L</b>
        <b style={{ color: INFO_BASE.T.color }}>T</b>
        <sup>−2</sup>
      </span>
    );
  }
  if (id === "balanza") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="60" y1="10" x2="60" y2="58" />
        <line x1="34" y1="58" x2="86" y2="58" />
        <line x1="18" y1="18" x2="102" y2="12" />
        <circle cx="60" cy="15" r="3.5" className="ev-acento" />
        <path d="M18 18 L8 40 H28 Z" />
        <path d="M102 12 L92 34 H112 Z" />
      </svg>
    );
  }
  if (id === "laboratorio") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="34" y1="8" x2="86" y2="8" />
        <line x1="60" y1="8" x2="76" y2="46" />
        <circle cx="78" cy="50" r="7" className="ev-acento" />
        <path d="M40 46 Q60 58 80 46" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "componentes") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="20" y1="54" x2="104" y2="54" className="ev-tenue" />
        <line x1="20" y1="54" x2="20" y2="6" className="ev-tenue" />
        <line x1="20" y1="54" x2="84" y2="14" className="ev-flecha" />
        <path d="M84 14 L72 15 L78 24 Z" className="ev-relleno" />
        <line x1="84" y1="14" x2="84" y2="54" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "suma") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="16" y1="54" x2="58" y2="38" />
        <line x1="58" y1="38" x2="96" y2="12" />
        <line x1="16" y1="54" x2="96" y2="12" className="ev-flecha" />
        <path d="M96 12 L84 14 L89 23 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "paralelogramo") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M16 54 L70 54 L104 14 L50 14 Z" className="ev-tenue" />
        <line x1="16" y1="54" x2="70" y2="54" />
        <line x1="16" y1="54" x2="50" y2="14" />
        <line x1="16" y1="54" x2="104" y2="14" className="ev-flecha" />
      </svg>
    );
  }
  if (id === "prediccion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="48" x2="112" y2="48" className="ev-tenue" />
        <rect x="14" y="36" width="20" height="9" rx="3" className="ev-relleno" />
        <line x1="84" y1="48" x2="84" y2="18" />
        <path d="M84 18 L98 23 L84 28 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "encuentro") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="40" x2="112" y2="40" className="ev-tenue" />
        <rect x="12" y="28" width="20" height="9" rx="3" className="ev-relleno" />
        <rect x="88" y="43" width="20" height="9" rx="3" />
        <line x1="62" y1="54" x2="62" y2="14" />
        <path d="M62 14 L76 19 L62 24 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "frenado") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="48" x2="112" y2="48" className="ev-tenue" />
        <rect x="40" y="36" width="22" height="9" rx="3" className="ev-relleno" />
        <rect x="94" y="22" width="6" height="26" />
        <path d="M18 40 H34 M22 34 H34" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "caida") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="58" x2="112" y2="58" className="ev-tenue" />
        <rect x="34" y="12" width="16" height="46" className="ev-tenue" />
        <circle cx="62" cy="14" r="3.2" className="ev-relleno" />
        <circle cx="62" cy="19" r="2.4" />
        <circle cx="62" cy="30" r="2.4" />
        <circle cx="62" cy="48" r="2.4" />
      </svg>
    );
  }
  if (id === "horizontal") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="58" x2="112" y2="58" className="ev-tenue" />
        <rect x="10" y="16" width="20" height="42" className="ev-tenue" />
        <path d="M30 16 Q70 16 88 54" className="ev-trazo" />
        <path d="M82 50 L96 50 L93 58 L85 58 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "parabolico") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="58" x2="112" y2="58" className="ev-tenue" />
        <path d="M14 56 Q58 -6 102 56" className="ev-trazo" />
        <path d="M14 56 L26 44" />
        <path d="M96 50 L110 50 L107 58 L99 58 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "dibuja") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M14 8 V56 H112" className="ev-tenue" />
        <path d="M14 50 L40 26 L66 26 L96 40" />
        <circle cx="40" cy="26" r="3.2" className="ev-relleno" />
        <circle cx="66" cy="26" r="3.2" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "velocidad") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M14 4 V28 H112 M14 36 V60 H112" className="ev-tenue" />
        <path d="M14 26 L46 10 L78 10 L108 20" />
        <path d="M14 42 H46 M46 50 H78 M78 56 H108" className="ev-trazo" />
      </svg>
    );
  }
  if (id === "area") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M14 8 V56 H112" className="ev-tenue" />
        <path d="M14 56 L36 24 L84 24 L106 56 Z" className="ev-relleno ev-area" />
        <path d="M14 56 L36 24 L84 24 L106 56" />
      </svg>
    );
  }
  return (
    <span className="ev-opciones">
      {["A", "B", "C", "D", "E"].map((l) => (
        <span key={l} className={l === "B" ? "on" : ""}>
          {l}
        </span>
      ))}
    </span>
  );
}
