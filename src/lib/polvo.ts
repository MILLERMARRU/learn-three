// ══ Cola de ráfagas de polvo (la consume <CapaPolvo/> dentro del Canvas) ───────
export interface Rafaga {
  pos: [number, number, number];
  color: string;
  n?: number;
  radio?: number;
  fuerza?: number;
  tamano?: number;
  vida?: number;
}

const cola: Rafaga[] = [];

export function emitirPolvo(r: Rafaga) {
  cola.push(r);
}

export function tomarPolvo(): Rafaga[] {
  return cola.splice(0, cola.length);
}
