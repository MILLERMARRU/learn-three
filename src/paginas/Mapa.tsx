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
              <span className="sr-only" aria-live="polite">
                {modo === "niveles" ? `Nivel ${actual + 1} de ${total}: ${NIVELES_FISICA[actual]}` : `Etapa ${etapas[actual]?.numero}: ${etapas[actual]?.titulo}`}
              </span>
              <span className="cn-cont" aria-hidden>
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
              nombre="Niveles de Física"
              etiqueta={(titulo, i) => `Nivel ${i + 1}: ${titulo}${disponible(i) ? "" : " (próximamente)"}`}
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
              nombre={`Etapas del nivel ${n}`}
              etiqueta={(e) => `Etapa ${e.numero}: ${e.titulo}${prog[e.clave] ? " (completada)" : ""}`}
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
  if (id === "angular") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="60" cy="32" r="24" className="ev-tenue" />
        <line x1="60" y1="32" x2="84" y2="32" className="ev-tenue" />
        <path d="M72 32 A12 12 0 0 0 54 21.6" />
        <line x1="60" y1="32" x2="48" y2="11.2" className="ev-flecha" />
        <circle cx="48" cy="11.2" r="4" className="ev-acento" />
      </svg>
    );
  }
  if (id === "poleas") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="38" cy="32" r="20" className="ev-tenue" />
        <circle cx="92" cy="32" r="10" className="ev-tenue" />
        <line x1="34.6" y1="12.3" x2="90.3" y2="22.1" />
        <line x1="34.6" y1="51.7" x2="90.3" y2="41.9" />
        <circle cx="38" cy="32" r="3.5" className="ev-acento" />
        <circle cx="92" cy="32" r="3.5" className="ev-acento" />
      </svg>
    );
  }
  if (id === "curva") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M84 60 V36 A24 24 0 0 0 36 36 V60" className="ev-tenue" />
        <circle cx="60" cy="36" r="2.5" className="ev-tenue" />
        <line x1="60" y1="36" x2="76.9" y2="19.1" className="ev-flecha" />
        <path d="M84 36 Q92 14 104 6" />
        <rect x="80" y="40" width="8" height="12" rx="2" className="ev-acento" />
      </svg>
    );
  }
  if (id === "equilibrio") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="40" y1="6" x2="80" y2="6" className="ev-tenue" />
        <line x1="60" y1="6" x2="60" y2="26" />
        <rect x="50" y="26" width="20" height="16" rx="2" className="ev-acento" />
        <line x1="60" y1="34" x2="60" y2="12" className="ev-flecha" />
        <line x1="60" y1="34" x2="60" y2="60" className="ev-flecha" />
      </svg>
    );
  }
  if (id === "aparejo") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="30" y1="4" x2="90" y2="4" className="ev-tenue" />
        <circle cx="78" cy="14" r="8" className="ev-tenue" />
        <circle cx="54" cy="34" r="8" className="ev-tenue" />
        <line x1="46" y1="34" x2="46" y2="4" />
        <line x1="62" y1="34" x2="70" y2="14" />
        <line x1="86" y1="14" x2="86" y2="48" />
        <rect x="47" y="46" width="14" height="12" rx="2" className="ev-acento" />
        <circle cx="86" cy="50" r="3" className="ev-acento" />
      </svg>
    );
  }
  if (id === "momento") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="14" y1="30" x2="106" y2="30" />
        <path d="M60 30 L52 46 H68 Z" className="ev-tenue" />
        <line x1="26" y1="30" x2="26" y2="40" className="ev-tenue" />
        <rect x="20" y="40" width="12" height="12" rx="2" className="ev-acento" />
        <line x1="92" y1="30" x2="92" y2="54" className="ev-flecha" />
      </svg>
    );
  }
  if (id === "newton") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="50" x2="112" y2="50" className="ev-tenue" />
        <rect x="18" y="32" width="22" height="18" rx="2" className="ev-acento" />
        <line x1="40" y1="41" x2="66" y2="41" className="ev-flecha" />
        <line x1="96" y1="50" x2="96" y2="24" />
        <path d="M96 24 L108 28 L96 32 Z" className="ev-relleno" />
      </svg>
    );
  }
  if (id === "plano") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M14 56 H106 L14 14 Z" className="ev-tenue" />
        <rect x="36" y="18" width="16" height="12" rx="2" transform="rotate(24.5 44 24)" className="ev-acento" />
        <rect x="60" y="30" width="16" height="12" rx="2" transform="rotate(24.5 68 36)" className="ev-tenue" />
        <line x1="50" y1="38" x2="74" y2="49" className="ev-flecha" />
      </svg>
    );
  }
  if (id === "sistemas") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="40" y1="6" x2="80" y2="6" className="ev-tenue" />
        <circle cx="60" cy="16" r="9" className="ev-tenue" />
        <line x1="51" y1="16" x2="51" y2="40" />
        <line x1="69" y1="16" x2="69" y2="30" />
        <rect x="44" y="40" width="14" height="16" rx="2" className="ev-acento" />
        <rect x="63" y="30" width="12" height="11" rx="2" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "atraccion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="36" cy="32" r="12" className="ev-acento" />
        <circle cx="86" cy="32" r="8" className="ev-tenue" />
        <line x1="49" y1="32" x2="62" y2="32" />
        <line x1="77" y1="32" x2="66" y2="32" />
        <line x1="36" y1="54" x2="86" y2="54" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "gravedad") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="38" cy="42" r="18" className="ev-tenue" />
        <line x1="38" y1="24" x2="38" y2="10" />
        <rect x="35" y="5" width="6" height="6" rx="1" className="ev-acento" />
        <rect x="80" y="8" width="12" height="48" rx="6" className="ev-tenue" />
        <circle cx="86" cy="34" r="4" className="ev-acento" />
      </svg>
    );
  }
  if (id === "orbitas") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="60" cy="32" r="7" className="ev-tenue" />
        <ellipse cx="60" cy="32" rx="18" ry="9" className="ev-tenue" />
        <ellipse cx="60" cy="32" rx="40" ry="22" />
        <rect x="96" y="28" width="7" height="7" rx="1" className="ev-acento" />
      </svg>
    );
  }
  if (id === "trabajo") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="50" x2="112" y2="50" className="ev-tenue" />
        <rect x="22" y="50" width="44" height="4" className="ev-tenue" />
        <rect x="28" y="34" width="16" height="16" rx="2" className="ev-acento" />
        <line x1="36" y1="42" x2="58" y2="28" />
        <rect x="84" y="36" width="14" height="14" rx="2" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "energia") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M8 14 C 30 14, 34 52, 52 52 L 68 52 C 86 52, 92 20, 112 20" className="ev-tenue" fill="none" />
        <rect x="12" y="6" width="12" height="7" rx="2" className="ev-acento" />
        <line x1="48" y1="8" x2="72" y2="8" />
        <line x1="48" y1="14" x2="62" y2="14" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "potencia") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="34" y1="58" x2="34" y2="8" className="ev-tenue" />
        <line x1="20" y1="8" x2="84" y2="8" className="ev-tenue" />
        <line x1="70" y1="8" x2="70" y2="30" />
        <rect x="62" y="30" width="16" height="14" rx="2" className="ev-acento" />
        <line x1="92" y1="20" x2="92" y2="58" className="ev-tenue" />
        <rect x="92" y="18" width="12" height="7" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "impulso") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="50" x2="112" y2="50" className="ev-tenue" />
        <ellipse cx="60" cy="46" rx="10" ry="4" className="ev-acento" />
        <circle cx="44" cy="44" r="6" className="ev-tenue" />
        <line x1="10" y1="30" x2="34" y2="30" className="ev-tenue" />
        <rect x="12" y="16" width="16" height="14" className="ev-tenue" />
        <line x1="74" y1="46" x2="98" y2="46" />
      </svg>
    );
  }
  if (id === "conservacion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="48" x2="112" y2="48" className="ev-tenue" />
        <rect x="34" y="30" width="24" height="16" rx="2" className="ev-acento" />
        <rect x="58" y="32" width="18" height="14" rx="2" className="ev-tenue" />
        <line x1="80" y1="38" x2="100" y2="38" />
      </svg>
    );
  }
  if (id === "choques") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="8" y1="48" x2="112" y2="48" className="ev-tenue" />
        <rect x="30" y="32" width="20" height="14" rx="2" className="ev-acento" />
        <rect x="64" y="32" width="20" height="14" rx="2" className="ev-tenue" />
        <line x1="26" y1="39" x2="12" y2="39" />
        <line x1="88" y1="39" x2="106" y2="39" />
      </svg>
    );
  }
  if (id === "resorte") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="10" y1="12" x2="10" y2="52" className="ev-tenue" />
        <polyline points="10,38 18,30 26,46 34,30 42,46 50,30 58,46 64,38" fill="none" />
        <rect x="64" y="28" width="20" height="20" rx="2" className="ev-acento" />
        <line x1="10" y1="52" x2="112" y2="52" className="ev-tenue" />
      </svg>
    );
  }
  if (id === "pendulo") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="40" y1="8" x2="80" y2="8" className="ev-tenue" />
        <line x1="60" y1="8" x2="74" y2="46" />
        <line x1="60" y1="8" x2="60" y2="50" className="ev-tenue" />
        <circle cx="75" cy="49" r="6" className="ev-acento" />
      </svg>
    );
  }
  if (id === "circulo") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <circle cx="60" cy="26" r="18" className="ev-tenue" fill="none" />
        <line x1="60" y1="26" x2="73" y2="14" />
        <circle cx="73" cy="14" r="3" className="ev-acento" />
        <line x1="73" y1="17" x2="73" y2="52" className="ev-tenue" />
        <line x1="34" y1="54" x2="86" y2="54" className="ev-tenue" />
        <rect x="68" y="48" width="10" height="6" className="ev-acento" />
      </svg>
    );
  }
  if (id === "onda") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M10 32 Q 22 12, 34 32 T 58 32 T 82 32 T 106 32" fill="none" />
        <line x1="22" y1="10" x2="46" y2="10" className="ev-tenue" />
        <rect x="6" y="26" width="6" height="12" className="ev-acento" />
      </svg>
    );
  }
  if (id === "pulso") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M10 28 L 40 28 Q 50 10, 60 28 L 96 28" fill="none" />
        <circle cx="100" cy="32" r="5" className="ev-tenue" />
        <line x1="105" y1="32" x2="105" y2="50" className="ev-tenue" />
        <rect x="100" y="50" width="10" height="9" className="ev-acento" />
      </svg>
    );
  }
  if (id === "estacionaria") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="12" y1="14" x2="12" y2="50" className="ev-tenue" />
        <line x1="108" y1="14" x2="108" y2="50" className="ev-tenue" />
        <path d="M12 32 Q 44 6, 60 32 T 108 32" fill="none" />
        <path d="M12 32 Q 44 58, 60 32 T 108 32" fill="none" className="ev-tenue" />
        <circle cx="60" cy="32" r="3" className="ev-acento" />
      </svg>
    );
  }
  if (id === "calentador") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <rect x="18" y="50" width="54" height="8" className="ev-tenue" />
        <path d="M26 20 V48 H64 V20" className="ev-tenue" fill="none" />
        <rect x="28" y="30" width="34" height="18" className="ev-tenue" />
        <line x1="92" y1="8" x2="92" y2="46" />
        <line x1="92" y1="26" x2="92" y2="50" className="ev-acento" />
        <circle cx="92" cy="52" r="5" className="ev-acento" />
      </svg>
    );
  }
  if (id === "dilatacion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <line x1="10" y1="10" x2="10" y2="50" />
        <rect x="10" y="24" width="70" height="8" className="ev-tenue" />
        <rect x="80" y="24" width="14" height="8" className="ev-acento" />
        <line x1="24" y1="44" x2="66" y2="44" className="ev-acento" strokeDasharray="4 3" />
        <line x1="80" y1="40" x2="80" y2="48" />
        <line x1="94" y1="40" x2="94" y2="48" />
      </svg>
    );
  }
  if (id === "flotacion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <rect x="14" y="26" width="92" height="30" className="ev-tenue" />
        <line x1="14" y1="26" x2="106" y2="26" />
        <rect x="34" y="14" width="20" height="24" className="ev-acento" />
        <rect x="68" y="18" width="20" height="24" className="ev-tenue" fill="none" strokeDasharray="3 3" />
      </svg>
    );
  }
  if (id === "prensa") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <path d="M18 18 V54 H102 V30" className="ev-tenue" fill="none" />
        <path d="M30 18 V44 H72 V30" className="ev-tenue" fill="none" />
        <line x1="18" y1="26" x2="30" y2="26" />
        <line x1="24" y1="6" x2="24" y2="22" className="ev-acento" />
        <rect x="76" y="16" width="22" height="10" className="ev-acento" />
        <line x1="72" y1="30" x2="102" y2="30" />
      </svg>
    );
  }
  if (id === "presion") {
    return (
      <svg viewBox="0 0 120 64" className="ev-svg" aria-hidden>
        <rect x="14" y="14" width="44" height="40" className="ev-tenue" />
        <line x1="36" y1="6" x2="36" y2="40" />
        <circle cx="36" cy="42" r="4" className="ev-acento" />
        <circle cx="88" cy="30" r="16" className="ev-tenue" fill="none" />
        <line x1="88" y1="30" x2="98" y2="20" />
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
