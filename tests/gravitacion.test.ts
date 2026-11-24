// ══ Pruebas de la gravitación universal ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { anguloOrbita, fuerzaProporcional, G0, gravedad, periodoKepler, velocidadEscalada, velocidadOrbital } from "../src/lib/gravitacion.ts";

test("la fuerza baja con el cuadrado de la distancia", () => {
  assert.equal(fuerzaProporcional(36, 1, 1, 3), 4);
  assert.equal(fuerzaProporcional(5, 1, 1, 0.5), 20);
});

test("la fuerza es proporcional a cada masa", () => {
  assert.equal(fuerzaProporcional(10, 2, 3, 1), 60);
  assert.equal(fuerzaProporcional(48, 0.5, 1, 2), 6);
});

test("duplicar ambas masas y la distancia deja la fuerza igual", () => {
  assert.equal(fuerzaProporcional(40, 2, 2, 2), 40);
});

test("razones fraccionarias exactas", () => {
  assert.equal(fuerzaProporcional(9, 4, 1, 1.5), 16);
});

test("gravedad en la superficie y a una altura igual al radio", () => {
  assert.equal(gravedad(1, 1), G0);
  assert.equal(gravedad(1, 1, 1), 2.5);
  assert.equal(gravedad(1, 1, 0.25), 6.4);
});

test("gravedad en otros planetas", () => {
  assert.equal(gravedad(2, 2), 5);
  assert.equal(gravedad(8, 2), 20);
  assert.equal(gravedad(0.5, 0.5), 20);
});

test("tercera ley de Kepler", () => {
  assert.equal(periodoKepler(2, 1, 4), 16);
  assert.equal(periodoKepler(1, 1, 9), 27);
  assert.equal(periodoKepler(27, 9, 1), 1);
});

test("velocidad orbital", () => {
  assert.equal(velocidadOrbital(1), 8);
  assert.equal(velocidadOrbital(4), 4);
  assert.equal(velocidadOrbital(16), 2);
});

test("ángulo recorrido en una órbita", () => {
  assert.equal(anguloOrbita(4, 1), Math.PI / 2);
  assert.equal(anguloOrbita(0, 3), 0);
});

test("velocidad orbital escalada", () => {
  assert.equal(velocidadEscalada(6, 9), 2);
  assert.equal(velocidadEscalada(4, 0.25), 8);
  assert.equal(velocidadEscalada(8, 64), 1);
});

test("Kepler con razones fraccionarias", () => {
  assert.equal(periodoKepler(8, 4, 9), 27);
  assert.equal(periodoKepler(27, 9, 1), 1);
});
