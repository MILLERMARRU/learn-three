// ══ Arrastre de objetos de la escena (mouse y dedo) ───────
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Estado de arrastre que vuelve a su valor inicial con cualquier `pointerup` o `pointercancel` de la ventana.
 *
 * React Three Fiber 9 no entrega `onPointerCancel` ni `onLostPointerCapture` a los objetos. Si el sistema
 * cancela un toque (un gesto del sistema, una notificación), no llega `onPointerUp` y el arrastre quedaría
 * activo: el objeto seguiría al siguiente puntero sin que nadie lo esté arrastrando.
 */
export function useArrastre<T>(inicial: T) {
  const ref = useRef<T>(inicial);
  useEffect(() => {
    const soltar = () => {
      ref.current = inicial;
    };
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, [inicial]);
  return ref;
}

const plano = new THREE.Plane();
const normal = new THREE.Vector3();
const origen = new THREE.Vector3();

/**
 * Punto donde el rayo del puntero corta el plano de la superficie que recibe el evento (su eje +Z local).
 *
 * Con el puntero capturado, si el dedo sale de la superficie, R3F repite en `e.point` la intersección del
 * momento de la captura y el objeto saltaría de vuelta al punto inicial. El rayo, en cambio, siempre es el
 * actual: así el objeto sigue al dedo aunque se salga de la franja invisible.
 */
export function puntoDelPuntero(e: ThreeEvent<PointerEvent>, destino: THREE.Vector3): THREE.Vector3 {
  const superficie = e.eventObject;
  normal.set(0, 0, 1).transformDirection(superficie.matrixWorld);
  plano.setFromNormalAndCoplanarPoint(normal, superficie.getWorldPosition(origen));
  return e.ray.intersectPlane(plano, destino) ?? destino.copy(e.point);
}
