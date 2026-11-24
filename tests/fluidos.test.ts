// ══ Pruebas de hidrostática ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { empuje, fuerzaPrensa, pesoAparente, presionAbsoluta, presionManometrica, profundidadFlotacion } from "../src/lib/fluidos.ts";

test("presión manométrica en agua, aceite y mercurio", () => {
  assert.equal(presionManometrica(1000, 3), 30000);
  assert.equal(presionManometrica(800, 5), 40000);
  assert.equal(presionManometrica(13600, 0.25), 34000);
});

test("presión absoluta", () => {
  assert.equal(presionAbsoluta(1000, 2), 120000);
});

test("prensa hidráulica", () => {
  assert.equal(fuerzaPrensa(10000, 0.01, 0.5), 200);
  assert.equal(fuerzaPrensa(8000, 2, 80), 200);
});

test("empuje de Arquímedes", () => {
  assert.equal(empuje(1000, 0.002), 20);
});

test("profundidad de flotación", () => {
  assert.equal(profundidadFlotacion(20, 600, 1000), 12);
  assert.equal(profundidadFlotacion(20, 900, 1000), 18);
  assert.equal(profundidadFlotacion(20, 1200, 1000), 20);
});

test("peso aparente", () => {
  assert.equal(pesoAparente(3, 0.001, 1000), 20);
});
