// ══ Etapa 1.2 · Balanza de homogeneidad: el término con la incógnita debe "pesar" lo mismo ───────
import { useState } from "react";
import { RONDAS_BALANZA, type ProblemaPHD } from "@/contenido/nivel-01/homogeneidad";
import { BASES, esAdimensional, formato, iguales, mul, type Dim } from "@/lib/dim";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { useEntradaDim } from "@/motor/useEntradaDim";
import { Balanza } from "@/three/Balanza";
import { CarruselItems } from "@/three/CarruselItems";
import { CascaronEtapa, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { DimTexto } from "@/ui/DimTexto";
import { Dc, Formula } from "@/ui/Formula";
import { Paleta } from "@/ui/Paleta";
import { teclaDeCaracter, teclasDimension, TecladoVirtual } from "@/ui/TecladoVirtual";

const META: MetaEtapa = {
  numero: "1.2",
  titulo: "Balanza de homogeneidad",
  nivel: "Análisis dimensional",
  nivelNum: 1,
  intro: (
    <>
      <b>Principio de homogeneidad:</b> en una ecuación física correcta, todos los sumandos tienen la misma dimensión. Escribe la dimensión de la incógnita hasta que la balanza quede nivelada.
    </>
  ),
  como: [
    { teclas: ["M", "L", "T"], texto: "escribe la dimensión de la incógnita" },
    { teclas: ["⏎"], texto: "comprueba cuando esté nivelada" },
    { teclas: ["H"], texto: "pista (cuesta puntos)" },
  ],
  siguiente: { ruta: "/nivel/1/laboratorio", titulo: "Etapa 1.3 · Laboratorio" },
};

const PESO: Record<string, number> = { M: 3, L: 2, T: 1, θ: 1.5, I: 1.2, J: 1.1, N: 1.3 };

function inclinacionPara(der: Dim, ref: Dim) {
  if (iguales(der, ref)) return 0;
  const s = BASES.reduce((a, b) => a + ((der[b] ?? 0) - (ref[b] ?? 0)) * PESO[b], 0);
  return (s >= 0 ? 1 : -1) * 0.27;
}

type Retroalimentacion = { clave: string; tipo: "ok" | "mal" | "info"; texto: string; comprobado?: Dim };

export default function EtapaBalanza() {
  const motor = useEtapa<ProblemaPHD>({ clave: "n1-balanza", rondas: RONDAS_BALANZA, avanceMs: 1700 });
  const p = motor.item;
  const guiado = motor.ronda === "guiado";
  const vivo = motor.ronda !== "solo";
  const clave = `${motor.r}-${p.id}`;
  const ent = useEntradaDim(clave, p.respuesta, guiado);
  const [fb, setFb] = useState<Retroalimentacion | null>(null);
  const [errTecla, setErrTecla] = useState<{ k: string; id: number } | null>(null);
  const retro = fb?.clave === clave ? fb : null;

  const incognita: Dim = ent.parseo.adimensional ? {} : ent.parseo.dim;
  const termVivo = mul(incognita, p.termino.cofactor);
  // en la ronda "solo" la balanza solo reacciona al comprobar
  const termMostrado = vivo ? termVivo : (retro?.comprobado ?? p.termino.cofactor);
  const hayAlgo = vivo ? !ent.parseo.vacio : !!retro?.comprobado;
  const equilibrada = hayAlgo && iguales(termMostrado, p.referencia.dim) && (vivo ? ent.parseo.valido : true);
  const inclinacion = motor.fase === "exito" ? 0 : inclinacionPara(termMostrado, p.referencia.dim);

  const acertar = () => {
    motor.acierto();
    setFb({ clave, tipo: "ok", texto: `¡Nivelada! La ecuación es homogénea: la incógnita mide ${formato(p.respuesta)}.` });
  };

  const teclear = (k: string) => {
    if (!motor.jugando) return;
    const r = ent.escribir(k);
    if (r === "ignorada") return;
    if (r === "mal") {
      motor.error();
      setErrTecla((e) => ({ k: k.toLowerCase(), id: (e?.id ?? 0) + 1 }));
      setFb({ clave, tipo: "mal", texto: "Esa tecla no va ahí: sigue la tecla que brilla." });
      return;
    }
    sfx.tecla();
    if (retro?.tipo === "mal" || retro?.tipo === "info") setFb(null);
    if (r === "completo") acertar();
  };

  const comprobar = () => {
    if (!motor.jugando || guiado) return;
    const c = ent.comprobar();
    if (c.incompleto) {
      setFb({ clave, tipo: "info", texto: ent.texto ? "Completa el exponente." : "Escribe la dimensión de la incógnita." });
      return;
    }
    if (c.ok) return acertar();
    motor.error();
    setErrTecla((e) => ({ k: "intro", id: (e?.id ?? 0) + 1 }));
    setFb({
      clave,
      tipo: "mal",
      texto: vivo ? "La balanza no está nivelada: el término todavía no mide lo mismo." : "No se equilibra. Mira hacia dónde se inclina y corrige.",
      comprobado: mul(ent.parseo.adimensional ? {} : ent.parseo.dim, p.termino.cofactor),
    });
  };

  const pedirPista = () => {
    if (motor.pedirPista(2)) setFb({ clave, tipo: "info", texto: motor.pistas + 1 >= 2 ? p.pistas[1] : p.pistas[0] });
  };

  const borrar = () => {
    ent.borrar();
    sfx.borrar();
  };

  // la misma acción para el teclado físico y el virtual
  const accion = (k: string) => {
    if (!motor.jugando) return;
    if (k === "intro") comprobar();
    else if (k === "borrar") borrar();
    else if (k === "h") pedirPista();
    else teclear(k);
  };

  useTeclas((e) => {
    if (!motor.jugando) return;
    if (e.key === "Enter") accion("intro");
    else if (e.key === "Backspace") accion("borrar");
    else if (e.key === "Escape") ent.limpiar();
    else if (e.key.toLowerCase() === "h" || e.key === "?") accion("h");
    else teclear(e.key);
  });

  const fase = motor.fase === "exito" ? "exito" : retro?.tipo === "mal" ? "error" : "idle";
  const refAdim = esAdimensional(p.referencia.dim);
  const derUnidad = esAdimensional(termMostrado) && !(!hayAlgo && esAdimensional(p.termino.cofactor));

  // carrusel: la balanza actual al centro, la del siguiente ejercicio esperando a la derecha
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={6.4}
      render={(x, rol) =>
        rol === "actual" ? (
          <Balanza
            izq={{ dim: p.referencia.dim, unidad: refAdim, etiqueta: <><Dc>{p.referencia.etiqueta}</Dc> = {formato(p.referencia.dim)}</> }}
            der={{
              dim: termMostrado,
              unidad: derUnidad,
              etiqueta: (
                <>
                  <Dc>{p.termino.etiqueta}</Dc> = {hayAlgo || !esAdimensional(p.termino.cofactor) ? formato(termMostrado) : "?"}
                </>
              ),
            }}
            inclinacion={inclinacion}
            equilibrada={equilibrada || motor.fase === "exito"}
            fase={fase}
            faseId={motor.faseId}
          />
        ) : (
          // vista previa: el ejercicio tal como empieza (sin la incógnita)
          <Balanza
            izq={{ dim: x.referencia.dim, unidad: esAdimensional(x.referencia.dim), etiqueta: null }}
            der={{ dim: x.termino.cofactor, unidad: false, etiqueta: null }}
            inclinacion={inclinacionPara(x.termino.cofactor, x.referencia.dim)}
            equilibrada={false}
            fase="idle"
            faseId={0}
            etiquetas={false}
          />
        )
      }
    />
  );

  const panel = (
    <>
      <p className="pregunta">{p.contexto}</p>
      <div className="ecuacion-grande" key={clave}>
        <Formula tam="xl">{p.ecuacion}</Formula>
      </div>
      <div className="variables">
        {p.variables.map((v, i) => (
          <span key={i} className="var-chip">
            <Formula tam="s">{v.s}</Formula> {v.nombre} <b>{formato(v.dim)}</b>
          </span>
        ))}
      </div>
      {p.nota && <p className="nota">{p.nota}</p>}
      <p className="pregunta">
        ¿Qué dimensión debe tener <Formula tam="s">{p.incognita}</Formula> para que la ecuación sea homogénea?
      </p>
      {vivo && (
        <div className={`algebra ${equilibrada ? "alg-ok" : ""}`}>
          <span>
            <Dc>{p.termino.etiqueta}</Dc> = {ent.parseo.vacio ? "?" : formato(incognita)} · {p.termino.cofactorTxt} = <b>{ent.parseo.vacio ? "?" : formato(termVivo)}</b>
          </span>
          <span className="alg-vs">{equilibrada ? "=" : "≠"}</span>
          <span>
            <Dc>{p.referencia.etiqueta}</Dc> = <b>{formato(p.referencia.dim)}</b>
          </span>
        </div>
      )}
      <p className="hud-ayuda">
        {motor.info.desc} <span className="hud-pistas">Pistas {motor.pistas}/2</span>
      </p>
      {/* en móvil no hay teclado: paleta y botones */}
      <div className="solo-movil">
        <Paleta onTecla={teclear} onBorrar={borrar} />
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || motor.pistas >= 2}>
            Pista <span className="btn-meta">{motor.pistas}/2</span>
          </button>
          {!guiado && (
            <button className="btn btn-pri" onClick={comprobar} disabled={!motor.jugando}>
              Comprobar
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <CascaronEtapa
      retro={retro ? <RetroLinea tipo={retro.tipo}>{retro.texto}</RetroLinea> : null}
      meta={META}
      motor={motor}
      escena={escena}
      panel={panel}
      respuesta={
        <div className={`rc-linea ${retro?.tipo === "mal" ? "sacudir" : ""} ${motor.fase === "exito" ? "rc-ok" : ""}`} key={`r${motor.faseId}`}>
          <span className="rc-lado">
            <Dc>{p.incognita}</Dc>
            <span className="rc-igual">=</span>
          </span>
          <DimTexto texto={ent.texto} guia={guiado ? ent.objetivo : undefined} cursor={motor.jugando} />
        </div>
      }
      teclado={
        <TecladoVirtual
          activas={teclasDimension(!guiado)}
          siguiente={guiado && motor.jugando ? teclaDeCaracter(ent.objetivo[ent.texto.length]) : null}
          onTecla={accion}
          error={errTecla}
        />
      }
      escenario={{ encuadre: { w: 7.2, h: 5.9 }, balanceo: 0.1, vista: clave }}
    />
  );
}
