// ══ Estrellas (0–3) ───────
export function Estrellas({ n, max = 3, tam = "s" }: { n: number; max?: number; tam?: "s" | "l" }) {
  return (
    <span className={`estrellas estrellas-${tam}`} aria-label={`${n} de ${max} estrellas`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? "est-on" : "est-off"} style={{ animationDelay: `${i * 0.14}s` }}>
          ★
        </span>
      ))}
    </span>
  );
}
