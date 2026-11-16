// ══ Examen genérico tipo admisión: opción múltiple con tiempo, vista previa 3D y carrusel de preguntas ───────
// Cada nivel lo usa con sus preguntas y su forma de dibujar la vista previa.
import { useEffect, useState, type ReactNode } from "react";
import { useTeclas } from "@/lib/teclado";
import { sfx } from "@/lib/sonido";
import { useEtapa, type RondaDef } from "@/motor/etapa";
import { CarruselItems } from "@/three/CarruselItems";
import { Incognita } from "@/three/Incognita";
import type { FaseAnim } from "@/three/Pieza";
import { CascaronEtapa, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { TecladoVirtual } from "@/ui/TecladoVirtual";

export interface PreguntaBase {
  id: string;
  enunciado: ReactNode;
  opciones: { texto: ReactNode }[];
  correcta: number;
  explicacion: ReactNode;
}

interface Props<Q extends PreguntaBase> {
  meta: MetaEtapa;
  clave: string;
  rondas: RondaDef<Q>[];
  /** Dibuja la pregunta en 3D: `opcion` es la que se previsualiza (o null). */
  vista3D: (q: Q, opcion: number | null, respondida: boolean, fase: FaseAnim, faseId: number) => ReactNode;
  encuadre?: { w: number; h: number };
  paso?: number;
  pie?: string;
  centro?: [number, number];
}

const SEGUNDOS = 45;
const LETRAS = ["A", "B", "C", "D", "E"];

export function Examen<Q extends PreguntaBase>({ meta, clave: claveEtapa, rondas, vista3D, encuadre = { w: 4.6, h: 3.1 }, paso = 4.6, pie = "Pasa el mouse por una opción para verla en 3D", centro }: Props<Q>) {
  const motor = useEtapa<Q>({ clave: claveEtapa, rondas, avanceMs: 2200 });
  const q = motor.item;
  const clave = q.id;
  const [st, setSt] = useState<{ clave: string; elegida: number | null; hover: number | null; t0: number }>({ clave: "", elegida: null, hover: null, t0: 0 });
  const actual = st.clave === clave ? st : { clave, elegida: null, hover: null, t0: 0 };
  const [ahora, setAhora] = useState(0);

  // reloj por pregunta: se reinicia cuando cambia la pregunta
  useEffect(() => {
    if (!motor.jugando) return;
    const inicio = performance.now();
    setSt((s) => ({ ...(s.clave === clave ? s : { clave, elegida: null, hover: null }), clave, t0: inicio }));
    const id = window.setInterval(() => setAhora(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [clave, motor.jugando]);

  const restante = actual.t0 ? Math.max(0, SEGUNDOS - (ahora - actual.t0) / 1000) : SEGUNDOS;

  const responder = (i: number) => {
    if (i < 0 || !motor.jugando || actual.elegida !== null) return;
    setSt({ ...actual, elegida: i });
    if (i === q.correcta) motor.acierto();
    else motor.fallo(3600);
  };

  useEffect(() => {
    if (motor.jugando && actual.t0 && restante <= 0 && actual.elegida === null) {
      setSt((s) => ({ ...s, elegida: -1 }));
      motor.fallo(3600);
    }
    // se evalúa en cada tic del reloj
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante]);

  useTeclas((e) => {
    if (!motor.jugando) return;
    const k = e.key.toUpperCase();
    const i = LETRAS.indexOf(k) >= 0 ? LETRAS.indexOf(k) : ["1", "2", "3", "4", "5"].indexOf(e.key);
    if (i >= 0 && i < q.opciones.length) responder(i);
  });

  const respondida = actual.elegida !== null;
  const vista = respondida ? q.correcta : actual.hover;
  const fase: FaseAnim = motor.fase === "exito" ? "exito" : "idle";

  // carrusel: la pregunta actual al centro y la siguiente esperando a la derecha
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={paso}
      render={(x, rol) => (rol === "actual" ? vista3D(q, vista !== null && vista >= 0 ? vista : null, respondida, fase, motor.faseId) : rol === "siguiente" ? <Incognita nombre={`pregunta ${motor.todos.findIndex((t) => t.item === x) + 1}`} /> : null)}
    />
  );

  const panel = (
    <>
      <div className="examen-cab">
        <span className="kicker">
          Pregunta {motor.i + 1} de {motor.tamanoRonda}
        </span>
        <span className={`reloj ${restante < 10 ? "reloj-urgente" : ""}`}>{Math.ceil(restante)} s</span>
      </div>
      <div className="reloj-barra">
        <span style={{ transform: `scaleX(${restante / SEGUNDOS})` }} />
      </div>
      <p className="enunciado" key={clave}>
        {q.enunciado}
      </p>
      <div className="opciones">
        {q.opciones.map((o, i) => {
          const cls = respondida ? (i === q.correcta ? "op-ok" : i === actual.elegida ? "op-mal" : "op-off") : "";
          return (
            <button
              key={i}
              className={`opcion ${cls}`}
              onClick={() => responder(i)}
              onMouseEnter={() => {
                if (!respondida) {
                  setSt({ ...actual, hover: i });
                  sfx.seleccion();
                }
              }}
              onMouseLeave={() => !respondida && setSt({ ...actual, hover: null })}
              disabled={respondida}
            >
              <kbd>{LETRAS[i]}</kbd>
              <span>{o.texto}</span>
            </button>
          );
        })}
      </div>
      <p className="hud-ayuda">Una sola oportunidad por pregunta.</p>
    </>
  );

  return (
    <CascaronEtapa
      retro={
        respondida ? (
          <RetroLinea tipo={actual.elegida === q.correcta ? "ok" : "mal"}>
            {actual.elegida === -1 ? "Se acabó el tiempo. " : ""}
            {q.explicacion}
          </RetroLinea>
        ) : null
      }
      meta={meta}
      motor={motor}
      escena={escena}
      panel={panel}
      respuesta={
        <div className={`rc-linea rc-examen ${respondida ? (actual.elegida === q.correcta ? "rc-ok" : "rc-mal") : ""}`}>
          {vista !== null && vista >= 0 ? (
            <>
              <span className="rc-letra">{LETRAS[vista]}</span>
              <span className="rc-opcion">{q.opciones[vista].texto}</span>
            </>
          ) : (
            <span className="rc-espera">elige A, B, C, D o E</span>
          )}
        </div>
      }
      teclado={
        <TecladoVirtual
          activas={Object.fromEntries(LETRAS.slice(0, q.opciones.length).map((l, i) => [l.toLowerCase(), { color: "#d9c3a0", sub: String(i + 1) }]))}
          onTecla={(k) => responder(LETRAS.indexOf(k.toUpperCase()))}
        />
      }
      escenario={{ encuadre, vista: clave, centro }}
      pieEscena={<span>{pie}</span>}
    />
  );
}
