// ══ Pruebas de estática: ángulos notables exactos, suma de fuerzas, equilibrio, cuerdas y plano inclinado ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { dosCuerdas, enEquilibrio, enPlano, fuerza, modulo, proyectar, senCos, sumar } from "../src/lib/estatica.ts";

describe("senCos con ángulos notables", () => {
  test("37° y 53° son exactos en los cuatro cuadrantes", () => {
    assert.deepEqual(senCos(37), [0.6, 0.8]);
    assert.deepEqual(senCos(53), [0.8, 0.6]);
    assert.deepEqual(senCos(127), [0.8, -0.6]);
    assert.deepEqual(senCos(217), [-0.6, -0.8]);
    assert.deepEqual(senCos(323), [-0.6, 0.8]);
  });

  test("30° y 60° dan ½ exacto; 90° y 180° sin errores de redondeo", () => {
    assert.equal(senCos(30)[0], 0.5);
    assert.equal(senCos(60)[1], 0.5);
    assert.deepEqual(senCos(90), [1, -0]);
    assert.deepEqual(senCos(180), [-0, -1]);
  });
});

describe("fuerzas y equilibrio", () => {
  test("50 N a 37° tiene componentes 40 y 30", () => {
    assert.deepEqual(fuerza(50, 37), [40, 30]);
  });

  test("la resultante de fuerzas opuestas es nula", () => {
    const fs = [fuerza(50, 90), fuerza(50, 270)];
    assert.ok(enEquilibrio(fs));
    assert.equal(modulo(sumar([fuerza(30, 0), fuerza(40, 90)])), 50);
  });

  test("proyección sobre un eje", () => {
    assert.equal(proyectar([3, 4], [1, 0]), 3);
    assert.equal(proyectar([3, 4], [0, 1]), 4);
  });
});

describe("cuerdas y plano inclinado", () => {
  test("lámpara de 50 N con cuerdas a 37° y 53°: 30 N y 40 N", () => {
    const [t1, t2] = dosCuerdas(50, 37, 53);
    assert.equal(t1, 30);
    assert.equal(t2, 40);
    // las tres fuerzas cierran el polígono
    assert.ok(enEquilibrio([fuerza(t1, 180 - 37), fuerza(t2, 53), fuerza(50, 270)]));
  });

  test("bloque de 100 N en un plano de 37°: 60 N paralelos y 80 N perpendiculares", () => {
    assert.deepEqual(enPlano(100, 37), { paralela: 60, normal: 80 });
    assert.equal(enPlano(90, 30).paralela, 45);
  });
});
