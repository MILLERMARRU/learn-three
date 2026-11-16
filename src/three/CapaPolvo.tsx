// ══ Polvo: ráfagas de partículas aditivas que se dispersan y desvanecen ───────
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { tomarPolvo } from "@/lib/polvo";

interface Vivo {
  pts: THREE.Points;
  vel: Float32Array;
  t: number;
  vida: number;
  tamano: number;
}

function texturaPunto() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

export function CapaPolvo() {
  const grupo = useRef<THREE.Group>(null!);
  const vivos = useRef<Vivo[]>([]);
  const tex = useMemo(texturaPunto, []);
  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((_, dtCrudo) => {
    const dt = Math.min(0.05, dtCrudo);
    for (const r of tomarPolvo()) {
      const n = r.n ?? 140;
      const radio = r.radio ?? 0.4;
      const fuerza = r.fuerza ?? 1;
      const p = new Float32Array(n * 3);
      const v = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        // punto aleatorio dentro de una esfera
        const u = Math.random() * 2 - 1;
        const th = Math.random() * Math.PI * 2;
        const rr = radio * Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        const ox = s * Math.cos(th);
        const oy = u;
        const oz = s * Math.sin(th);
        p[i * 3] = r.pos[0] + ox * rr;
        p[i * 3 + 1] = r.pos[1] + oy * rr;
        p[i * 3 + 2] = r.pos[2] + oz * rr;
        const vel = (0.4 + Math.random() * 2.2) * fuerza;
        v[i * 3] = (ox + (Math.random() - 0.5) * 1.2) * vel;
        v[i * 3 + 1] = (oy + (Math.random() - 0.2) * 1.1) * vel;
        v[i * 3 + 2] = (oz + (Math.random() - 0.5) * 1.2) * vel;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
      const tamano = r.tamano ?? 0.09;
      const mat = new THREE.PointsMaterial({
        size: tamano,
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: r.color,
      });
      const pts = new THREE.Points(geo, mat);
      grupo.current.add(pts);
      vivos.current.push({ pts, vel: v, t: 0, vida: r.vida ?? 2.1, tamano });
    }

    for (let k = vivos.current.length - 1; k >= 0; k--) {
      const b = vivos.current[k];
      b.t += dt;
      const arr = b.pts.geometry.attributes.position.array as Float32Array;
      const freno = Math.pow(0.962, dt * 60);
      for (let i = 0; i < b.vel.length; i += 3) {
        b.vel[i] *= freno;
        b.vel[i + 1] = b.vel[i + 1] * freno + dt * 0.28;
        b.vel[i + 2] *= freno;
        arr[i] += b.vel[i] * dt;
        arr[i + 1] += b.vel[i + 1] * dt;
        arr[i + 2] += b.vel[i + 2] * dt;
      }
      b.pts.geometry.attributes.position.needsUpdate = true;
      const m = b.pts.material as THREE.PointsMaterial;
      m.opacity = Math.max(0, 1 - Math.pow(b.t / b.vida, 1.6));
      m.size = b.tamano * (1 - (b.t / b.vida) * 0.5);
      if (b.t > b.vida) {
        grupo.current.remove(b.pts);
        b.pts.geometry.dispose();
        m.dispose();
        vivos.current.splice(k, 1);
      }
    }
  });

  return <group ref={grupo} />;
}
