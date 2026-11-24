// ══ Pruebas de termodinámica ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { carnot, eficiencia, energiaInterna, kelvin, trabajoIsobarico, volumenFinal } from "../src/lib/termo.ts";

test("kelvin", () => {
  assert.equal(kelvin(27), 300);
  assert.equal(kelvin(-73), 200);
});

test("leyes de los gases", () => {
  assert.equal(volumenFinal(2, 10, 300, 4, 300), 5);
  assert.equal(volumenFinal(1, 10, 300, 1, 450), 15);
  assert.equal(volumenFinal(2, 9, 400, 3, 800), 12);
});

test("trabajo a presión constante", () => {
  assert.equal(trabajoIsobarico(2e5, 0.01, 0.03), 4000);
  assert.equal(trabajoIsobarico(1e5, 0.05, 0.02), -3000);
});

test("primera ley", () => {
  assert.equal(energiaInterna(5000, 2000), 3000);
});

test("eficiencias", () => {
  assert.equal(eficiencia(1000, 600), 0.4);
  assert.equal(carnot(600, 300), 0.5);
  assert.equal(carnot(500, 300), 0.4);
});
