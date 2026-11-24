// ══ Pruebas de ondas electromagnéticas ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { distanciaRadar, frecuenciaEM, longitudEM, malus, regionEspectro } from "../src/lib/ondasEM.ts";

test("c = λ·f", () => {
  assert.equal(longitudEM(100e6), 3);
  assert.equal(longitudEM(6e14), 5e-7);
  assert.equal(frecuenciaEM(2), 150e6);
});

test("ley de Malus", () => {
  assert.equal(malus(80, 60), 20);
  assert.equal(malus(50, 37), 32);
  assert.equal(malus(40, 90), 0);
});

test("radar", () => {
  assert.equal(distanciaRadar(200e-6), 30000);
});

test("regiones del espectro", () => {
  assert.equal(regionEspectro(3), "radio");
  assert.equal(regionEspectro(0.01), "microondas");
  assert.equal(regionEspectro(500e-9), "visible");
  assert.equal(regionEspectro(1e-10), "rayos X");
});
