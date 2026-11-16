// ══ Cascarón común de una etapa: escena 3D + panel + rondas + pantallas de transición ───────
import type { ReactNode } from "react";
import { INFO_RONDA, puntosDe, estrellasDe, type Motor, type Ronda } from "@/motor/etapa";
import { navegar } from "@/lib/ruta";
import { useTeclas } from "@/lib/teclado";
import { Escenario, type EscenarioProps } from "@/three/Escenario";
import { BarraSuperior } from "./BarraSuperior";
import { Estrellas } from "./Estrellas";

export interface MetaEtapa {
  numero: string;
  titulo: string;
  nivel: string;
  nivelNum: number;
  intro: ReactNode;
  como: { teclas: string[]; texto: string }[];
  siguiente?: { ruta: string; titulo: string };
  /** Textos propios de cada ronda (si la mecánica no es "escribir encima"). */
  descRondas?: Partial<Record<Ronda, string>>;
}

export const descRonda = (meta: MetaEtapa, r: Ronda) => meta.descRondas?.[r] ?? INFO_RONDA[r].desc;

interface Props<T extends { id: string }> {
  meta: MetaEtapa;
  motor: Motor<T>;
  escena: ReactNode;
  /** Enunciado: flota arriba a la izquierda (en móvil va debajo de la escena). */
  panel: ReactNode;
  escenario?: Omit<EscenarioProps, "children">;
  pieEscena?: ReactNode;
  /** Teclado virtual que se muestra bajo la escena (escritorio). */
  teclado?: ReactNode;
  /** Lo que el alumno escribe, en grande, entre la escena y el teclado. */
  respuesta?: ReactNode;
  /** Retroalimentación: aparece justo encima de la respuesta. */
  retro?: ReactNode;
  /** Contenido para la esquina inferior derecha (p. ej. la leyenda de piezas). */
  lateral?: ReactNode;
}

export function CascaronEtapa<T extends { id: string }>({ meta, motor, escena, panel, escenario, pieEscena, teclado, respuesta, retro, lateral }: Props<T>) {
  useTeclas((e) => {
    if (motor.fase === "intro" || motor.fase === "fin-ronda") {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        motor.continuar();
      }
    } else if (motor.fase === "fin") {
      if (e.key === "Enter") navegar(meta.siguiente?.ruta ?? "/");
      else if (e.key.toLowerCase() === "r") motor.reiniciar();
      else if (e.key === "Escape") navegar("/");
    } else if (e.key === "Escape" && !motor.jugando) {
      navegar("/");
    }
  });

  // rondas + progreso + estrellas viven en la barra superior
  const estado = (
    <div className="bs-estado">
      <div className="rondas" role="tablist">
        {motor.rondas.map((r, i) => (
          <span key={i} className={`ronda-tab ${i === motor.r ? "on" : i < motor.r ? "hecha" : ""}`}>
            <b>{INFO_RONDA[r.ronda].n}</b> {INFO_RONDA[r.ronda].corto}
          </span>
        ))}
      </div>
      <div className="progreso" aria-label={`Ítem ${motor.i + 1} de ${motor.tamanoRonda}`}>
        {Array.from({ length: motor.tamanoRonda }, (_, i) => {
          const res = motor.resRonda[i];
          const cls = res ? (res.correcto ? `p-ok p-${puntosDe(res)}` : "p-mal") : i === motor.i ? "p-actual" : "";
          return <span key={i} className={`prog-seg ${cls}`} />;
        })}
      </div>
      <Estrellas n={motor.estrellas} />
    </div>
  );
  const s = motor.stats;

  return (
    <div className={`etapa ${teclado ? "con-teclado" : ""} ${respuesta ? "con-respuesta" : ""}`}>
      <section className="etapa-escena">
        <BarraSuperior migas={[{ texto: "Física", ruta: "/" }, { texto: `Nivel ${meta.nivelNum} · ${meta.nivel}` }, { texto: `${meta.numero} ${meta.titulo}` }]} centro={estado} />
        <Escenario {...escenario}>{escena}</Escenario>
        <div className="escena-pie">{pieEscena ?? <span>Arrastra para girar</span>}</div>
        {respuesta && (
          <div className="zona-respuesta">
            <div className="zr-linea" key={retro ? "r" : "k"}>
              {retro ?? (
                <span className="zr-kicker">
                  {INFO_RONDA[motor.ronda].titulo} · <b>{Math.min(motor.i + 1, motor.tamanoRonda)}</b> / {motor.tamanoRonda}
                </span>
              )}
            </div>
            {respuesta}
          </div>
        )}
        {teclado && <div className="zona-teclado">{teclado}</div>}
        <div className="hud-stats" aria-label="Estadísticas">
          <div className="hud-stat">
            <b>{s.aciertos}</b>
            <span>/{s.total} aciertos</span>
          </div>
          <div className="hud-stat">
            <b>{s.precision ?? "—"}</b>
            <span>% a la primera</span>
          </div>
          <div className="hud-stat">
            <b>{s.racha}</b>
            <span>racha</span>
          </div>
        </div>
        {lateral && <div className="hud-lateral">{lateral}</div>}
        <Transiciones meta={meta} motor={motor} />
      </section>
      <aside className="hud-enunciado">{panel}</aside>
    </div>
  );
}

function Transiciones<T extends { id: string }>({ meta, motor }: { meta: MetaEtapa; motor: Motor<T> }) {
  if (motor.fase === "intro") {
    return (
      <div className="velo">
        <div className="tarjeta">
          <div className="kicker">Etapa {meta.numero}</div>
          <h2 className="tarjeta-titulo">{meta.titulo}</h2>
          <p className="tarjeta-texto">{meta.intro}</p>
          <ul className="como">
            {meta.como.map((c, i) => (
              <li key={i}>
                <span className="como-teclas">
                  {c.teclas.map((k) => (
                    <kbd key={k}>{k}</kbd>
                  ))}
                </span>
                {c.texto}
              </li>
            ))}
          </ul>
          <div className="tarjeta-rondas">
            {motor.rondas.map((r, i) => (
              <span key={i}>
                <b>{INFO_RONDA[r.ronda].n}</b> {INFO_RONDA[r.ronda].corto} · {r.items.length}
              </span>
            ))}
          </div>
          <div className="tarjeta-acciones">
            <button className="btn" onClick={() => navegar("/")}>
              Volver
            </button>
            <button className="btn btn-pri" onClick={motor.continuar} autoFocus>
              Empezar <kbd>⏎</kbd>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (motor.fase === "fin-ronda") {
    const res = motor.res[motor.r];
    const pts = res.reduce((a, x) => a + puntosDe(x), 0);
    const aciertos = res.filter((x) => x?.correcto).length;
    const pistas = res.reduce((a, x) => a + (x?.pistas ?? 0), 0);
    const sig = motor.rondas[motor.r + 1];
    return (
      <div className="velo">
        <div className="tarjeta">
          <div className="kicker">{INFO_RONDA[motor.ronda].titulo} · completa</div>
          <Estrellas n={estrellasDe(pts, res.length * 3)} tam="l" />
          <div className="cifras">
            <span>
              <b>
                {aciertos}/{res.length}
              </b>
              aciertos
            </span>
            <span>
              <b>{pistas}</b>
              pistas
            </span>
            <span>
              <b>{pts}</b>
              puntos
            </span>
          </div>
          <div className="siguiente-ronda">
            <span className="kicker">Sigue</span>
            <h3>{INFO_RONDA[sig.ronda].titulo}</h3>
            <p>{descRonda(meta, sig.ronda)}</p>
          </div>
          <div className="tarjeta-acciones">
            <button className="btn btn-pri" onClick={motor.continuar} autoFocus>
              Siguiente ronda <kbd>⏎</kbd>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (motor.fase === "fin") {
    const msg = ["Sigue practicando: repite la etapa.", "¡Bien! Repite para sacar más estrellas.", "¡Muy bien! Ya casi lo dominas.", "¡Perfecto! Lo dominas."][motor.estrellas];
    return (
      <div className="velo">
        <div className="tarjeta tarjeta-fin">
          <div className="kicker">Etapa {meta.numero} · terminada</div>
          <h2 className="tarjeta-titulo">{meta.titulo}</h2>
          <Estrellas n={motor.estrellas} tam="l" />
          <p className="tarjeta-texto">{msg}</p>
          <div className="cifras">
            <span>
              <b>
                {motor.puntos}/{motor.maximo}
              </b>
              puntos
            </span>
          </div>
          <div className="tarjeta-acciones">
            <button className="btn" onClick={motor.reiniciar}>
              Repetir <kbd>R</kbd>
            </button>
            {meta.siguiente ? (
              <button className="btn btn-pri" onClick={() => navegar(meta.siguiente!.ruta)} autoFocus>
                {meta.siguiente.titulo} <kbd>⏎</kbd>
              </button>
            ) : (
              <button className="btn btn-pri" onClick={() => navegar("/")} autoFocus>
                Volver al mapa <kbd>⏎</kbd>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function Retro({ tipo, children }: { tipo: "ok" | "mal" | "info"; children: ReactNode }) {
  return (
    <div className={`retro retro-${tipo}`} role="status">
      <span className="retro-ico">{tipo === "ok" ? "✓" : tipo === "mal" ? "✗" : "i"}</span>
      <span>{children}</span>
    </div>
  );
}

/** Versión en una línea, para encima de la respuesta. */
export function RetroLinea({ tipo, children }: { tipo: "ok" | "mal" | "info"; children: ReactNode }) {
  return (
    <span className={`retro-linea rl-${tipo}`} role="status">
      <span className="retro-ico">{tipo === "ok" ? "✓" : tipo === "mal" ? "✗" : "i"}</span>
      {children}
    </span>
  );
}
