// ══ Pruebas de trabajo, energía y potencia ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { alturaMaxima, energiaCinetica, energiaElastica, energiaPotencial, potenciaElevar, potenciaEntregada, rapidezEnergia, rapidezTrasTrabajo, trabajo, trabajoNeto } from "../src/lib/energia.ts";

test("trabajo de una fuerza horizontal e inclinada", () => {
  assert.equal(trabajo(20, 5), 100);
  assert.equal(trabajo(25, 10, 37), 200);
  assert.equal(trabajo(20, 9, 60), 90);
});

test("una fuerza perpendicular no trabaja", () => {
  assert.equal(trabajo(50, 4, 90), 0);
});

test("energías cinética, potencial y elástica", () => {
  assert.equal(energiaCinetica(2, 10), 100);
  assert.equal(energiaPotencial(3, 5), 150);
  assert.equal(energiaElastica(200, 0.5), 25);
});

test("teorema del trabajo y la energía", () => {
  assert.equal(rapidezTrasTrabajo(100, 2), 10);
  assert.equal(rapidezTrasTrabajo(10, 1, 4), 6);
  assert.equal(rapidezTrasTrabajo(-64, 2, 6), 0);
});

test("trabajo neto con rozamiento y fuerza inclinada", () => {
  assert.equal(trabajoNeto(30, 0, 5, 2, 0.5), 100);
  // F sen 37° = 30 N alivia la normal: N = 100 − 30 = 70 N
  assert.equal(trabajoNeto(50, 37, 2, 10, 0.5), 10);
  assert.equal(trabajoNeto(0, 0, 6.4, 2, 0.5), -64);
});

test("conservación de la energía mecánica", () => {
  assert.equal(rapidezEnergia(0, 5), 10);
  assert.equal(rapidezEnergia(6, 3.2), 10);
  assert.equal(rapidezEnergia(10, -5), 0);
  assert.equal(alturaMaxima(10), 5);
});

test("potencia y rendimiento", () => {
  assert.equal(potenciaElevar(50, 8, 4), 1000);
  assert.equal(potenciaEntregada(800, 0.8), 1000);
});
