// ══ Etapa 1.1 · Moléculas dimensionales: escribe la ecuación dimensional y mírala armarse ───────
import { useState } from "react";
import { RONDAS_MOLECULAS, type Magnitud } from "@/contenido/nivel-01/magnitudes";
import { BASES, esAdimensional, formato, type Base } from "@/lib/dim";
import { layoutMolecula } from "@/lib/layout-molecula";
import { sfx } from "@/lib/sonido";
import { useTeclas } from "@/lib/teclado";
import { useEtapa } from "@/motor/etapa";
import { useEntradaDim } from "@/motor/useEntradaDim";
import { CarruselItems } from "@/three/CarruselItems";
import { Etiqueta } from "@/three/Etiqueta";
import { Incognita } from "@/three/Incognita";
import { Molecula } from "@/three/Molecula";
import type { Marca } from "@/three/Pieza";
import { CascaronEtapa, RetroLinea, type MetaEtapa } from "@/ui/CascaronEtapa";
import { DimTexto } from "@/ui/DimTexto";
import { Dc, Formula } from "@/ui/Formula";
import { LeyendaPiezas } from "@/ui/LeyendaPiezas";
import { Paleta } from "@/ui/Paleta";
import { teclaDeCaracter, teclasDimension, TecladoVirtual } from "@/ui/TecladoVirtual";

const META: MetaEtapa = {
  numero: "1.1",
  titulo: "Moléculas dimensionales",
  nivel: "Análisis dimensional",
  nivelNum: 1,
  intro: (
    <>
      Toda magnitud se arma con 7 piezas fundamentales: la <b>regla</b> (L), la <b>pesa</b> (M), el <b>reloj de arena</b> (T)… Escribe su <b>ecuación dimensional</b> y mira cómo se construye: lo que multiplica va arriba, lo que divide va abajo.
    </>
  ),
  como: [
    { teclas: ["M", "L", "T"], texto: "masa, longitud y tiempo (θ con la tecla O)" },
    { teclas: ["−", "2"], texto: "exponentes: T−2 es T⁻²" },
    { teclas: ["1"], texto: "si es adimensional" },
    { teclas: ["H"], texto: "pista flotante (cuesta puntos)" },
  ],
  siguiente: { ruta: "/nivel/1/balanza", titulo: "Etapa 1.2 · Balanza" },
};

type Retroalimentacion = { clave: string; tipo: "ok" | "mal" | "info"; texto: string; marcas?: Partial<Record<Base, Marca>> };

export default function EtapaMoleculas() {
  const motor = useEtapa<Magnitud>({ clave: "n1-moleculas", rondas: RONDAS_MOLECULAS, avanceMs: 1500 });
  const mag = motor.item;
  const guiado = motor.ronda === "guiado";
  const clave = `${motor.r}-${mag.id}`;
  const ent = useEntradaDim(clave, mag.dim, guiado);
  const [fb, setFb] = useState<Retroalimentacion | null>(null);
  const [errTecla, setErrTecla] = useState<{ k: string; id: number } | null>(null);
  const retro = fb?.clave === clave ? fb : null;
  const nivelPista = motor.pistas;
  const verFantasma = guiado || nivelPista >= 3;
  const verFormula = motor.ronda !== "solo" || nivelPista >= 1;

  const acertar = () => {
    motor.acierto();
    setFb({ clave, tipo: "ok", texto: `Exacto: [${mag.nombre}] = ${formato(mag.dim)}` });
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
    if (retro?.tipo !== "ok") setFb(null);
    if (r === "completo") acertar();
  };

  const comprobar = () => {
    if (!motor.jugando || guiado) return;
    const c = ent.comprobar();
    if (c.incompleto) {
      setFb({ clave, tipo: "info", texto: ent.texto ? "Completa el exponente (ej. T−2)." : "Primero escribe la ecuación dimensional." });
      return;
    }
    if (c.ok) return acertar();
    motor.error();
    setErrTecla((e) => ({ k: "intro", id: (e?.id ?? 0) + 1 }));
    const marcas: Partial<Record<Base, Marca>> = {};
    for (const b of BASES) {
      if (!ent.parseo.dim[b]) continue;
      marcas[b] = ent.parseo.dim[b] === mag.dim[b] ? "ok" : "mal";
    }
    const texto = motor.ronda === "solo" ? "No es correcto. Revisa las piezas en rojo o pide una pista (H)." : c.diag.join(" · ");
    setFb({ clave, tipo: "mal", texto, marcas });
  };

  const pedirPista = () => {
    if (motor.pedirPista(3)) setFb({ clave, tipo: "info", texto: nivelPista + 1 >= 3 ? "Mira la molécula fantasma: rellénala." : "Mira la pista flotante junto a la molécula." });
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
  const adim = esAdimensional(mag.dim);
  // la pista flota a la izquierda de la molécula (con la cámara cerca, arriba no cabe)
  const ancho = adim ? 0.9 : Math.max(layoutMolecula(mag.dim).ancho, 1);

  // carrusel: la molécula actual al centro y, a la derecha, una incógnita con el nombre del siguiente
  const escena = (
    <CarruselItems
      items={motor.todos}
      indice={motor.indiceGlobal}
      paso={4.6}
      render={(x, rol) =>
        rol === "actual" ? (
          <>
            <Molecula key={`${clave}-g`} dim={verFantasma ? mag.dim : {}} unidad={verFantasma && adim} variante="fantasma" faseId={motor.faseId} fase={fase} tips={false} />
            <Molecula key={clave} dim={ent.parseo.dim} unidad={ent.parseo.adimensional} marcas={retro?.marcas} fase={fase} faseId={motor.faseId} />
            <Etiqueta position={[-ancho / 2 - 0.3, 0.2, 0]} visible={nivelPista > 0 && motor.fase !== "exito"} className="etq-pista etq-pista-izq">
              <span className="etq-pista-n">Pista {Math.min(nivelPista, 2)}</span>
              {nivelPista >= 2 ? mag.pistas[1] : mag.pistas[0]}
            </Etiqueta>
          </>
        ) : rol === "siguiente" ? (
          <Incognita nombre={x.nombre} />
        ) : null
      }
    />
  );

  const respuesta = (
    <div className={`rc-linea ${retro?.tipo === "mal" ? "sacudir" : ""} ${motor.fase === "exito" ? "rc-ok" : ""}`} key={`r${motor.faseId}`}>
      <span className="rc-lado">
        <Dc>{mag.simbolo}</Dc>
        <span className="rc-igual">=</span>
      </span>
      <DimTexto texto={ent.texto} guia={guiado ? ent.objetivo : undefined} cursor={motor.jugando} />
    </div>
  );

  const panel = (
    <>
      <p className="pregunta">¿Cuál es la ecuación dimensional {mag.articulo === "el" ? "del" : "de la"}</p>
      <h1 className="palabra" key={clave}>
        {mag.nombre}
      </h1>
      <div className={`definicion ${verFormula ? "" : "oculta"}`}>
        {verFormula ? <Formula tam="l">{mag.formula}</Formula> : <span className="oculta-txt">Fórmula oculta · pulsa H</span>}
        <span className="unidad">{mag.unidad}</span>
      </div>
      <p className="hud-ayuda">
        {motor.info.desc} <span className="hud-pistas">Pistas {nivelPista}/3</span>
      </p>
      {/* en móvil no hay teclado: paleta y botones */}
      <div className="solo-movil">
        <Paleta onTecla={teclear} onBorrar={borrar} />
        <div className="acciones">
          <button className="btn" onClick={pedirPista} disabled={!motor.jugando || nivelPista >= 3}>
            Pista <span className="btn-meta">{nivelPista}/3</span>
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
      meta={META}
      motor={motor}
      escena={escena}
      panel={panel}
      respuesta={respuesta}
      retro={retro ? <RetroLinea tipo={retro.tipo}>{retro.texto}</RetroLinea> : null}
      lateral={<LeyendaPiezas resaltar={BASES.filter((b) => ent.parseo.dim[b])} />}
      teclado={
        <TecladoVirtual
          activas={teclasDimension(!guiado)}
          siguiente={guiado && motor.jugando ? teclaDeCaracter(ent.objetivo[ent.texto.length]) : null}
          onTecla={accion}
          error={errTecla}
        />
      }
      escenario={{ encuadre: { w: 4.8, h: 3.05 }, vista: clave }}
    />
  );
}
