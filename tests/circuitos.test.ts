// ══ Pruebas de electrodinámica ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { corriente, energiaKWh, paralelo, potenciaIR, potenciaVI, potenciaVR, resistencia, serie, voltaje } from "../src/lib/circuitos.ts";

test("ley de Ohm", () => {
  assert.equal(corriente(12, 3), 4);
  assert.equal(voltaje(0.5, 40), 20);
  assert.equal(resistencia(9, 0.3), 30);
});

test("serie y paralelo", () => {
  assert.equal(serie([4, 6, 10]), 20);
  assert.equal(paralelo([6, 3]), 2);
  assert.equal(paralelo([12, 12, 12]), 4);
});

test("potencia y energía", () => {
  assert.equal(potenciaVI(220, 0.5), 110);
  assert.equal(potenciaIR(3, 4), 36);
  assert.equal(potenciaVR(12, 8), 18);
  assert.equal(energiaKWh(1500, 2), 3);
});
