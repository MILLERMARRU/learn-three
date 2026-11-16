// ══ Geometrías de las piezas: objetos que representan su magnitud ───────
// Cada pieza tiene "cuerpo" (porcelana marfil) y "acento" (el color de su magnitud).
// L = regla · M = pesa · T = reloj de arena · θ = termómetro · I = rayo · J = bombilla · N = molécula · U = adimensional
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { TipoPieza } from "./Pieza";

export interface Partes {
  cuerpo: THREE.BufferGeometry | null;
  acento: THREE.BufferGeometry | null;
}

function pon(g: THREE.BufferGeometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  return g;
}

function unir(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (!geos.length) return null;
  const limpias = geos.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    // solo posición, normal y uv para poder unirlas
    for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k);
    return n;
  });
  return mergeGeometries(limpias, false);
}

/** Cilindro entre dos puntos (para palitos y pilares). */
function palo(a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const dir = b.clone().sub(a);
  const g = new THREE.CylinderGeometry(r, r, dir.length(), 12);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()));
  const m = a.clone().add(b).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

// centra cuerpo + acento juntos en el origen
function centrar(p: Partes): Partes {
  const caja = new THREE.Box3();
  for (const g of [p.cuerpo, p.acento]) {
    if (!g) continue;
    g.computeBoundingBox();
    caja.union(g.boundingBox!);
  }
  const c = caja.getCenter(new THREE.Vector3());
  for (const g of [p.cuerpo, p.acento]) g?.translate(-c.x, -c.y, -c.z);
  return p;
}

function regla(): Partes {
  const marcas: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 10; i++) {
    const h = i % 5 === 0 ? 0.12 : 0.065;
    marcas.push(pon(new THREE.BoxGeometry(0.018, h, 0.02), -0.55 + i * 0.11, 0.1 - h / 2, 0.106));
  }
  marcas.push(pon(new THREE.BoxGeometry(0.035, 0.215, 0.215), -0.625, 0, 0), pon(new THREE.BoxGeometry(0.035, 0.215, 0.215), 0.625, 0, 0));
  return { cuerpo: new RoundedBoxGeometry(1.22, 0.2, 0.2, 3, 0.05), acento: unir(marcas) };
}

function pesa(): Partes {
  return {
    cuerpo: unir([
      pon(new THREE.CylinderGeometry(0.27, 0.32, 0.44, 48), 0, -0.17, 0),
      pon(new THREE.CylinderGeometry(0.19, 0.27, 0.08, 48), 0, 0.09, 0),
      pon(new THREE.CylinderGeometry(0.085, 0.11, 0.1, 32), 0, 0.18, 0),
      pon(new THREE.SphereGeometry(0.13, 32, 20), 0, 0.3, 0),
    ]),
    acento: unir([pon(new THREE.CylinderGeometry(0.306, 0.31, 0.075, 48, 1, true), 0, -0.21, 0), pon(new THREE.CylinderGeometry(0.327, 0.327, 0.03, 48, 1, true), 0, -0.375, 0)]),
  };
}

function relojArena(): Partes {
  const pilares = [90, 210, 330].map((gr) => {
    const r = THREE.MathUtils.degToRad(gr);
    const x = Math.cos(r) * 0.27;
    const z = Math.sin(r) * 0.27;
    return palo(new THREE.Vector3(x, -0.38, z), new THREE.Vector3(x, 0.38, z), 0.022);
  });
  return {
    cuerpo: unir([pon(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 40), 0, 0.4, 0), pon(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 40), 0, -0.4, 0), ...pilares]),
    acento: unir([pon(new THREE.ConeGeometry(0.24, 0.35, 40), 0, 0.195, 0, Math.PI), pon(new THREE.ConeGeometry(0.24, 0.35, 40), 0, -0.195, 0)]),
  };
}

function termometro(): Partes {
  const marcas: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) marcas.push(pon(new THREE.BoxGeometry(0.05, 0.012, 0.02), -0.075, -0.1 + i * 0.09, 0.03));
  return {
    cuerpo: unir([pon(new THREE.CapsuleGeometry(0.075, 0.58, 6, 18), 0, 0.12, 0), ...marcas]),
    acento: unir([pon(new THREE.SphereGeometry(0.15, 32, 20), 0, -0.3, 0), pon(new THREE.CylinderGeometry(0.034, 0.034, 0.44, 12), 0, -0.04, 0.058)]),
  };
}

function rayo(): Partes {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [0.09, 0.5], [-0.22, -0.03], [-0.02, -0.03], [-0.11, -0.5], [0.23, 0.07], [0.03, 0.07],
  ];
  s.moveTo(...pts[0]);
  for (const p of pts.slice(1)) s.lineTo(...p);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2 });
  return { cuerpo: null, acento: g };
}

function bombilla(): Partes {
  return {
    cuerpo: unir([
      pon(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 24), 0, -0.3, 0),
      pon(new THREE.TorusGeometry(0.124, 0.016, 8, 28), 0, -0.26, 0, Math.PI / 2),
      pon(new THREE.TorusGeometry(0.124, 0.016, 8, 28), 0, -0.32, 0, Math.PI / 2),
      pon(new THREE.SphereGeometry(0.06, 16, 10), 0, -0.4, 0),
    ]),
    acento: unir([pon(new THREE.SphereGeometry(0.27, 40, 28), 0, 0.1, 0), pon(new THREE.CylinderGeometry(0.12, 0.17, 0.14, 32), 0, -0.17, 0)]),
  };
}

function molecula(): Partes {
  const a = [new THREE.Vector3(-0.21, -0.11, 0.03), new THREE.Vector3(0.21, -0.11, -0.03), new THREE.Vector3(0, 0.22, 0)];
  return {
    cuerpo: unir([palo(a[0], a[2], 0.035), palo(a[1], a[2], 0.035), palo(a[0], a[1], 0.03)]),
    acento: unir(a.map((p) => pon(new THREE.SphereGeometry(0.15, 28, 18), p.x, p.y, p.z))),
  };
}

function unidad(): Partes {
  return {
    cuerpo: new THREE.DodecahedronGeometry(0.36, 0),
    acento: pon(new THREE.TorusGeometry(0.44, 0.018, 8, 64), 0, 0, 0, Math.PI / 2.4),
  };
}

let CACHE: Record<TipoPieza, Partes> | null = null;

export function partesDe(tipo: TipoPieza): Partes {
  if (!CACHE) {
    CACHE = {
      L: centrar(regla()),
      M: centrar(pesa()),
      T: centrar(relojArena()),
      θ: centrar(termometro()),
      I: centrar(rayo()),
      J: centrar(bombilla()),
      N: centrar(molecula()),
      U: centrar(unidad()),
    };
  }
  return CACHE[tipo];
}
