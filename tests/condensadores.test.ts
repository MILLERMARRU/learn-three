// ══ Pruebas de condensadores ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { capParalelo, capSerie, carga, energiaCV, energiaQC, energiaQV } from "../src/lib/condensadores.ts";

test("carga y dieléctrico", () => {
  assert.equal(carga(2, 12), 24);
  assert.equal(carga(0.5, 100), 50);
  assert.equal(carga(1.5, 20, 4), 120);
});

test("asociación", () => {
  assert.equal(capParalelo([2, 3, 5]), 10);
  assert.equal(capSerie([6, 3]), 2);
  assert.equal(capSerie([12, 12, 12]), 4);
});

test("energía almacenada", () => {
  assert.equal(energiaCV(4, 10), 200);
  assert.equal(energiaQC(60, 6), 300);
  assert.equal(energiaQV(40, 5), 100);
});
