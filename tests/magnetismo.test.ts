// ══ Pruebas de electromagnetismo ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { campoRecto, femFaraday, femMovimiento, fuerzaCarga, fuerzaConductor, radioOrbita } from "../src/lib/magnetismo.ts";

test("fuerza sobre un conductor", () => {
  assert.equal(fuerzaConductor(0.2, 3, 0.05), 0.03);
  assert.equal(fuerzaConductor(0.5, 2, 0.08, 30), 0.04);
  assert.equal(fuerzaConductor(0.25, 4, 0.1, 53), 0.08);
  assert.equal(fuerzaConductor(1, 1, 1, 0), 0);
});

test("fuerza sobre una carga y radio de la órbita", () => {
  assert.equal(fuerzaCarga(2e-6, 1000, 0.5), 0.001);
  assert.equal(radioOrbita(2, 3, 1, 2), 3);
});

test("campo de un conductor recto", () => {
  assert.equal(campoRecto(10, 0.1), 2e-5);
});

test("inducción", () => {
  assert.equal(femMovimiento(0.5, 0.4, 3), 0.6);
  assert.equal(femFaraday(100, 0.02, 0.5), 4);
});
