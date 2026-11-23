// ══ Pruebas de las gráficas del movimiento: interpolación, áreas con signo y pendientes ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { escalones, integrar, interpolar, pendientes, puntosDe } from "../src/lib/graficas.ts";

describe("interpolar", () => {
  test("lineal entre puntos", () => {
    assert.equal(interpolar([[0, 0], [4, 20]], 2), 10);
  });

  test("constante fuera del rango", () => {
    assert.equal(interpolar([[1, 5], [3, 9]], 0), 5);
    assert.equal(interpolar([[1, 5], [3, 9]], 10), 9);
  });
});

describe("integrar (área bajo la curva)", () => {
  const trapecio: [number, number][] = [[0, 0], [2, 10], [6, 10], [8, 0]];

  test("triángulo + rectángulo + triángulo", () => {
    assert.equal(integrar(trapecio, 8), 60);
    assert.equal(integrar(trapecio, 2), 10);
  });

  test("el área bajo el eje cuenta negativa", () => {
    assert.equal(integrar([[0, 10], [4, -10]], 4), 0);
    assert.equal(integrar([[0, 10], [4, -10]], 2), 10);
  });

  test("escalones: los saltos verticales no suman área", () => {
    const v = escalones([5, -5], 2);
    assert.deepEqual(v, [[0, 5], [2, 5], [2, -5], [4, -5]]);
    assert.equal(integrar(v, 4), 0);
    assert.equal(integrar(v, 3), 5);
  });
});

describe("puntos y pendientes", () => {
  test("puntosDe reparte los valores cada dt", () => {
    assert.deepEqual(puntosDe([1, 2, 3], 2), [[0, 1], [2, 2], [4, 3]]);
  });

  test("la pendiente de cada tramo es Δx / Δt", () => {
    assert.deepEqual(pendientes([0, 10, 20, 20, 10], 2), [5, 5, 0, -5]);
  });
});
