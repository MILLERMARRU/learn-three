// ══ Pruebas de los vectores 2D: operaciones, formato del módulo y ángulos ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { anguloDe, escalar, fmtModulo, fmtVec, igualV, modulo, resta, suma } from "../src/lib/vec.ts";

describe("operaciones", () => {
  test("suma, resta y producto por escalar", () => {
    assert.deepEqual(suma([3, 1], [1, 2]), [4, 3]);
    assert.deepEqual(resta([3, 1], [1, 2]), [2, -1]);
    assert.deepEqual(escalar([3, -1], 2), [6, -2]);
  });

  test("módulo e igualdad", () => {
    assert.equal(modulo([3, 4]), 5);
    assert.equal(igualV([2, 3], [2, 3]), true);
    assert.equal(igualV([2, 3], [3, 2]), false);
  });
});

describe("formato", () => {
  test("usa el signo menos tipográfico", () => {
    assert.equal(fmtVec([-3, 4]), "(−3, 4)");
  });

  test("módulo exacto, con raíz simplificada o raíz simple", () => {
    assert.equal(fmtModulo([3, 4]), "5");
    assert.equal(fmtModulo([4, 4]), "4√2");
    assert.equal(fmtModulo([2, 3]), "√13");
  });
});

describe("anguloDe", () => {
  test("ángulo con el eje +x entre 0° y 360°", () => {
    assert.equal(anguloDe([1, 0]), 0);
    assert.equal(anguloDe([0, 1]), 90);
    assert.equal(anguloDe([-1, 0]), 180);
    assert.equal(anguloDe([0, -1]), 270);
  });
});
