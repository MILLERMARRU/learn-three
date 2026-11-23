// ══ Pruebas de dinámica: segunda ley, rozamiento y movimiento con aceleración constante ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { aceleracion, aceleracionEnPiso, aceleracionPara, fuerzaPara, posicion, rozamiento } from "../src/lib/dinamica.ts";

describe("segunda ley de Newton", () => {
  test("40 N sobre 10 kg dan 4 m/s²", () => {
    assert.equal(aceleracion(40, 10), 4);
  });

  test("rozamiento cinético: μ = 0,2 con 100 N de normal da 20 N", () => {
    assert.equal(rozamiento(0.2, 100), 20);
  });

  test("si la fuerza no vence al rozamiento, no hay aceleración", () => {
    assert.equal(aceleracionEnPiso(15, 10, 0.2), 0);
    assert.equal(aceleracionEnPiso(40, 10, 0.2), 2);
  });
});

describe("movimiento con aceleración constante", () => {
  test("desde el reposo con 4 m/s², en 2 s recorre 8 m", () => {
    assert.equal(posicion(4, 2), 8);
  });

  test("para recorrer 8 m en 2 s hace falta a = 4 m/s²", () => {
    assert.equal(aceleracionPara(8, 2), 4);
  });

  test("fuerza para llegar a tiempo: con y sin rozamiento", () => {
    assert.equal(fuerzaPara(10, 8, 2), 40);
    assert.equal(fuerzaPara(10, 4, 2, 0.2), 40);
  });
});
