// ══ Pruebas de oscilaciones ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { aceleracionMaxima, energiaMAS, periodoPendulo, periodoResorte, velocidadEnX, velocidadMaxima } from "../src/lib/oscilaciones.ts";

test("período del resorte con π² = 10", () => {
  assert.equal(periodoResorte(1, 10), 2);
  assert.equal(periodoResorte(1, 40), 1);
  assert.equal(periodoResorte(0.36, 10), 1.2);
});

test("cuadruplicar la masa duplica el período", () => {
  assert.equal(periodoResorte(4, 10), 2 * periodoResorte(1, 10));
});

test("período del péndulo con g = π²", () => {
  assert.equal(periodoPendulo(1), 2);
  assert.equal(periodoPendulo(2.25), 3);
  assert.equal(periodoPendulo(1, 2.5), 4);
});

test("velocidad y aceleración máximas", () => {
  assert.equal(velocidadMaxima(0.5, 4), 2);
  assert.equal(aceleracionMaxima(0.5, 4), 8);
});

test("rapidez a una distancia del centro", () => {
  assert.equal(velocidadEnX(5, 2, 3), 8);
  assert.equal(velocidadEnX(5, 2, 5), 0);
});

test("energía del oscilador", () => {
  assert.equal(energiaMAS(200, 0.1), 1);
});
