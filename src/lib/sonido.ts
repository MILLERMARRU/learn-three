// ══ Sonido con WebAudio (sin archivos) ───────
const CLAVE = "f3d:sonido";
let ctx: AudioContext | null = null;
let activo: boolean | null = null;
const oyentes = new Set<() => void>();

export function sonidoActivo(): boolean {
  if (activo === null) {
    try {
      activo = localStorage.getItem(CLAVE) !== "0";
    } catch {
      activo = true;
    }
  }
  return activo;
}

export function setSonido(v: boolean) {
  activo = v;
  try {
    localStorage.setItem(CLAVE, v ? "1" : "0");
  } catch {}
  oyentes.forEach((o) => o());
}

export function suscribirSonido(o: () => void) {
  oyentes.add(o);
  return () => {
    oyentes.delete(o);
  };
}

function audio(): AudioContext | null {
  if (!sonidoActivo() || typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tono(retraso: number, f: number, dur: number, vol: number, tipo: OscillatorType = "sine", fFin?: number) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + retraso;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(f, t0);
  if (fFin) osc.frequency.exponentialRampToValueAtTime(fFin, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function ruido(dur: number, vol: number, fDesde: number, fHasta: number) {
  const ac = audio();
  if (!ac) return;
  const n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filtro = ac.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 1.4;
  const t0 = ac.currentTime;
  filtro.frequency.setValueAtTime(fDesde, t0);
  filtro.frequency.exponentialRampToValueAtTime(fHasta, t0 + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filtro).connect(g).connect(ac.destination);
  src.start();
}

export const sfx = {
  tecla: () => tono(0, 1480, 0.04, 0.035, "triangle"),
  borrar: () => tono(0, 620, 0.05, 0.03, "triangle"),
  error: () => {
    tono(0, 210, 0.16, 0.06, "sawtooth", 130);
    tono(0.02, 160, 0.18, 0.04, "square", 110);
  },
  acierto: () => {
    tono(0, 660, 0.14, 0.06);
    tono(0.07, 990, 0.2, 0.055);
    tono(0.14, 1320, 0.32, 0.05);
  },
  polvo: () => ruido(0.9, 0.05, 2400, 500),
  pista: () => {
    tono(0, 880, 0.12, 0.04, "sine");
    tono(0.09, 1175, 0.18, 0.035, "sine");
  },
  ronda: () => {
    [523, 659, 784, 1047].forEach((f, i) => tono(i * 0.09, f, 0.3, 0.05));
  },
  seleccion: () => tono(0, 980, 0.05, 0.03, "sine"),
};
