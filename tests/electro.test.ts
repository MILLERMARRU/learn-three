// ══ Pruebas de electrostática ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { campo, coulomb, MICRO, potencial, seAtraen, trabajoElectrico } from "../src/lib/electro.ts";

test("ley de Coulomb", () => {
  assert.equal(coulomb(2 * MICRO, 5 * MICRO, 0.3), 1);
  assert.equal(coulomb(-6 * MICRO, 5 * MICRO, 0.1), 27);
  assert.equal(seAtraen(-1, 2), true);
  assert.equal(seAtraen(-1, -2), false);
});

test("campo de una carga puntual", () => {
  assert.equal(campo(4 * MICRO, 0.3), 400000);
  assert.equal(campo(-2 * MICRO, 0.1), 1800000);
});

test("potencial y trabajo", () => {
  assert.equal(potencial(2 * MICRO, 0.3), 60000);
  assert.equal(potencial(-3 * MICRO, 0.9), -30000);
  assert.equal(trabajoElectrico(2 * MICRO, 60000, 20000), 0.08);
});
