// ══ Pruebas de calor ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { calorSensible, dilatacion, equilibrio, temperaturaFinal } from "../src/lib/calor.ts";

test("dilatación lineal en mm", () => {
  assert.equal(dilatacion(10_000, 12e-6, 50), 6);
  assert.equal(dilatacion(25_000, 12e-6, 40), 12);
  assert.equal(dilatacion(5000, 24e-6, -50), -6);
});

test("calor sensible", () => {
  assert.equal(calorSensible(200, 1, 30), 6000);
  assert.equal(calorSensible(500, 0.5, 20), 5000);
});

test("temperatura final", () => {
  assert.equal(temperaturaFinal(20, 6000, 200, 1), 50);
  assert.equal(temperaturaFinal(10, 3000, 100, 0.5), 70);
});

test("equilibrio térmico", () => {
  assert.equal(equilibrio([{ m: 100, c: 1, T: 80 }, { m: 100, c: 1, T: 20 }]), 50);
  assert.equal(equilibrio([{ m: 200, c: 1, T: 10 }, { m: 100, c: 1, T: 70 }]), 30);
  assert.equal(equilibrio([{ m: 500, c: 0.1, T: 100 }, { m: 200, c: 1, T: 20 }]), 36);
});
