// ══ Pruebas de cantidad de movimiento y choques ───────
import assert from "node:assert/strict";
import { test } from "node:test";
import { alturaRebote, cantidadMovimiento, choque, choquePlastico, explosion, impulso, velocidadTrasImpulso } from "../src/lib/momento.ts";

test("impulso de un golpe constante y de uno triangular", () => {
  assert.equal(impulso(40, 0.5), 20);
  assert.equal(impulso(120, 0.5, "tri"), 30);
});

test("teorema del impulso, a favor y en contra", () => {
  assert.equal(velocidadTrasImpulso(20, 2), 10);
  assert.equal(velocidadTrasImpulso(8, 2, 3), 7);
  assert.equal(velocidadTrasImpulso(-9, 1, 6), -3);
});

test("cantidad de movimiento", () => {
  assert.equal(cantidadMovimiento(3, -4), -12);
});

test("choque plástico", () => {
  assert.equal(choquePlastico(2, 6, 1, 0), 4);
  assert.equal(choquePlastico(3, 4, 1, -8), 1);
});

test("explosión desde el reposo", () => {
  assert.equal(explosion(2, 3, 1), -6);
});

test("choque elástico entre masas iguales: intercambian velocidades", () => {
  assert.deepEqual(choque(1, 5, 1, 0, 1), { v1: 0, v2: 5 });
});

test("choque elástico y choque con e = 0,5", () => {
  assert.deepEqual(choque(1, 6, 2, 0, 1), { v1: -2, v2: 4 });
  assert.deepEqual(choque(2, 6, 1, 0, 0.5), { v1: 3, v2: 6 });
});

test("con e = 0 el choque es plástico", () => {
  assert.deepEqual(choque(3, 4, 1, 0, 0), { v1: 3, v2: 3 });
});

test("altura de rebote", () => {
  assert.equal(alturaRebote(5, 0.6), 1.8);
});
