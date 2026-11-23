// ══ Escenario 3D común: renderer, luces "foto de producto", encuadre, balanceo y arrastre ───────
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { movimientoReducido } from "@/lib/teclado";
import { CapaPolvo } from "./CapaPolvo";

interface Arrastre {
  x: number;
  y: number;
  activo: boolean;
  ultimo: number;
  px: number;
  py: number;
}

export interface EscenarioProps {
  children: ReactNode;
  /** Tamaño (en unidades 3D) que debe caber completo en pantalla. */
  encuadre?: { w: number; h: number };
  /** Amplitud del balanceo en reposo (radianes). */
  balanceo?: number;
  /** Se puede girar la escena arrastrando con el mouse o el dedo. */
  arrastrable?: boolean;
  /** Hay objetos que se arrastran con el dedo (bandera, punta del vector, puntos de una gráfica): el gesto no debe desplazar la página. */
  tactil?: boolean;
  className?: string;
  /** Desplaza el punto que mira la cámara. */
  centro?: [number, number];
  /** Cuando cambia (nuevo ejercicio), el giro hecho con el mouse vuelve suave a su sitio. */
  vista?: string;
  /** La escena está bajo el HUD de una etapa: el corrimiento lateral (`centro[0]`) solo se aplica cuando el enunciado flota encima (escritorio ancho). */
  hud?: boolean;
}

export function Escenario({ children, encuadre = { w: 6, h: 5 }, balanceo = 0.14, arrastrable = true, tactil = false, className = "", centro = [0, 0], vista = "", hud = false }: EscenarioProps) {
  const arrastre = useRef<Arrastre>({ x: 0, y: 0, activo: false, ultimo: 0, px: 0, py: 0 });

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      const a = arrastre.current;
      if (!a.activo) return;
      const dx = e.clientX - a.px;
      const dy = e.clientY - a.py;
      a.px = e.clientX;
      a.py = e.clientY;
      a.y += dx * 0.008;
      a.x = Math.max(-0.9, Math.min(0.9, a.x + dy * 0.006));
    };
    const soltar = () => {
      if (!arrastre.current.activo) return;
      arrastre.current.activo = false;
      arrastre.current.ultimo = performance.now();
      document.body.classList.remove("arrastrando");
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, []);

  return (
    <div
      className={`escenario ${arrastrable ? "es-arrastrable" : ""} ${arrastrable || tactil ? "es-tactil" : ""} ${className}`}
      onPointerDown={(e) => {
        if (!arrastrable || e.button !== 0) return;
        const a = arrastre.current;
        a.activo = true;
        a.px = e.clientX;
        a.py = e.clientY;
        document.body.classList.add("arrastrando");
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 30, position: [0, 0, 16], near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Luces />
        <Encuadre w={encuadre.w} h={encuadre.h} centro={centro} hud={hud} />
        <Balanceo arrastre={arrastre} amplitud={balanceo} vista={vista}>
          {children}
        </Balanceo>
        <CapaPolvo />
      </Canvas>
    </div>
  );
}

// Luz cálida principal desde arriba, contraluz fría desde atrás, poco relleno: el objeto "tiene forma"
function Luces() {
  const PI = Math.PI;
  return (
    <>
      <hemisphereLight args={["#fff4e6", "#050506", 0.42 * PI]} />
      <directionalLight color="#fff0da" intensity={1.65 * PI} position={[2, 14, 9]} />
      <directionalLight color="#bfd2ff" intensity={0.75 * PI} position={[-9, 5, -14]} />
      <directionalLight color="#ffe9cc" intensity={0.28 * PI} position={[10, -4, 8]} />
      <directionalLight color="#ffffff" intensity={0.25 * PI} position={[0, -12, 4]} />
    </>
  );
}

// Aleja o acerca la cámara para que el encuadre pedido quepa en cualquier proporción de pantalla
// con el enunciado al costado o debajo (≤ 1400 px) no hace falta correr la escena
const ENUNCIADO_ENCIMA = typeof window !== "undefined" ? window.matchMedia("(min-width: 1401px)") : null;

function Encuadre({ w, h, centro, hud }: { w: number; h: number; centro: [number, number]; hud: boolean }) {
  const { camera, size } = useThree();
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspecto = size.width / Math.max(1, size.height);
    // sin el enunciado encima la escena va centrada: un poco de aire a los costados para sus etiquetas
    const margen = hud && !ENUNCIADO_ENCIMA?.matches ? 1.1 : 1;
    const d = Math.max(h / 2 / t, (w * margen) / 2 / (t * aspecto));
    const cx = hud && !ENUNCIADO_ENCIMA?.matches ? 0 : centro[0];
    cam.position.x = THREE.MathUtils.damp(cam.position.x, cx, 4, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, centro[1], 4, dt);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, d, 4, dt);
    cam.lookAt(cam.position.x, cam.position.y, 0);
  });
  return null;
}

// Balanceo lento + giro con el mouse que se queda donde lo dejas (vuelve solo al cambiar de ejercicio)
function Balanceo({ arrastre, amplitud, vista, children }: { arrastre: RefObject<Arrastre>; amplitud: number; vista: string; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const rm = useRef(movimientoReducido());
  const v = useRef({ vista, volviendo: false });
  useFrame((st, dt) => {
    const a = arrastre.current;
    const t = st.clock.elapsedTime;
    if (vista !== v.current.vista) {
      v.current.vista = vista;
      v.current.volviendo = true;
    }
    if (v.current.volviendo && !a.activo) {
      const k = Math.pow(0.9, dt * 60);
      a.x *= k;
      a.y *= k;
      if (Math.abs(a.x) + Math.abs(a.y) < 0.002) v.current.volviendo = false;
    }
    const balanceo = rm.current ? 0 : Math.sin(t / 2.6) * amplitud;
    const cabeceo = rm.current ? 0 : Math.sin(t / 3.7) * 0.035;
    g.current.rotation.set(cabeceo + a.x, balanceo + a.y, 0);
  });
  return <group ref={g}>{children}</group>;
}
