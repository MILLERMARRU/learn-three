// ══ Pruebas de ondas mecánicas ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { frecuenciaArmonico, frecuenciaOnda, longitudArmonico, longitudOnda, velocidadCuerda, velocidadOnda } from "../src/lib/ondas.ts";

test("v = λ·f y sus despejes", () => {
  assert.equal(velocidadOnda(2, 5), 10);
  assert.equal(longitudOnda(12, 3), 4);
  assert.equal(frecuenciaOnda(340, 17), 20);
});

test("velocidad en una cuerda", () => {
  assert.equal(velocidadCuerda(100, 0.01), 100);
  assert.equal(velocidadCuerda(90, 0.1), 30);
});

test("cuadruplicar la tensión duplica la velocidad", () => {
  assert.equal(velocidadCuerda(400, 0.01), 2 * velocidadCuerda(100, 0.01));
});

test("armónicos de una cuerda fija", () => {
  assert.equal(longitudArmonico(1, 2), 4);
  assert.equal(longitudArmonico(4, 2), 1);
  assert.equal(frecuenciaArmonico(1, 40, 2), 10);
  assert.equal(frecuenciaArmonico(3, 40, 2), 30);
});
