// ══ Pruebas de la física de tiros (g = 10 m/s² y ángulos notables del curso) ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { alcance, alturaMax, componentes, posicion, senCos, tSuelo } from "../src/lib/tiro.ts";

const cerca = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

describe("senCos", () => {
  test("usa los valores del curso para 37° y 53°", () => {
    assert.deepEqual(senCos(37), [0.6, 0.8]);
    assert.deepEqual(senCos(53), [0.8, 0.6]);
  });

  test("90° es vertical y −90° hacia abajo", () => {
    assert.deepEqual(senCos(90), [1, 0]);
    assert.deepEqual(senCos(-90), [-1, 0]);
  });

  test("45° tiene seno y coseno iguales", () => {
    const [s, c] = senCos(45);
    cerca(s, Math.SQRT1_2);
    cerca(c, Math.SQRT1_2);
  });
});

describe("alcance y altura máxima", () => {
  test("37° y 53° dan el mismo alcance", () => {
    assert.equal(alcance(25, 37), 60);
    assert.equal(alcance(25, 53), 60);
  });

  test("45° da el alcance máximo: v² / g", () => {
    cerca(alcance(50, 45), 250);
    cerca(alcance(20, 45), 40);
  });

  test("altura máxima con 50 m/s a 37° es 45 m", () => {
    assert.equal(alturaMax(50, 37), 45);
  });
});

describe("tiempo de vuelo y posición", () => {
  test("tiro oblicuo desde el suelo: 2·v·senθ / g", () => {
    assert.equal(tSuelo({ x0: 0, y0: 0, v: 50, angulo: 37 }), 6);
  });

  test("lanzamiento horizontal desde 20 m tarda 2 s y cae a v·t", () => {
    const l = { x0: 0, y0: 20, v: 10, angulo: 0 };
    assert.equal(tSuelo(l), 2);
    const p = posicion(l, 2);
    assert.equal(p.x, 20);
    assert.equal(p.y, 0);
    assert.equal(p.vy, -20);
  });

  test("lanzado hacia arriba con 20 m/s llega a 20 m con v = 0", () => {
    const p = posicion({ x0: 0, y0: 0, v: 20, angulo: 90 }, 2);
    assert.equal(p.y, 20);
    assert.equal(p.vy, 0);
  });

  test("soltado desde 45 m tarda 3 s en caer", () => {
    assert.equal(tSuelo({ x0: 0, y0: 45, v: 0, angulo: -90 }), 3);
  });

  test("las componentes de 50 m/s a 37° son 40 y 30", () => {
    assert.deepEqual(componentes({ x0: 0, y0: 0, v: 50, angulo: 37 }), [40, 30]);
  });
});
