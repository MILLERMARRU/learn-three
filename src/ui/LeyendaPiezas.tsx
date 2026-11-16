// ══ Leyenda: qué objeto representa cada magnitud fundamental ───────
import { INFO_BASE, type Base } from "@/lib/dim";

const OBJETO: Record<Base, string> = {
  M: "pesa",
  L: "regla",
  T: "reloj de arena",
  θ: "termómetro",
  I: "rayo",
  J: "bombilla",
  N: "molécula",
};

export function LeyendaPiezas({ resaltar = [] }: { resaltar?: Base[] }) {
  return (
    <div className="leyenda">
      <div className="leyenda-tit">Las 7 piezas fundamentales</div>
      <div className="leyenda-grid">
        {(Object.keys(OBJETO) as Base[]).map((b) => (
          <span key={b} className={`ley-item ${resaltar.includes(b) ? "ley-on" : ""}`}>
            <b style={{ color: INFO_BASE[b].color }}>{b}</b>
            <span className="ley-obj">{OBJETO[b]}</span>
            <span className="ley-nom">
              {INFO_BASE[b].nombre} · {INFO_BASE[b].simboloUnidad}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
