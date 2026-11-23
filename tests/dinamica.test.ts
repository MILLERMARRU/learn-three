// ══ Pruebas de dinámica: segunda ley, rozamiento y movimiento con aceleración constante ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { aceleracion, aceleracionEnPiso, aceleracionPara, aceleracionPlano, atwood, fuerzaPara, mesaColgante, posicion, rozamiento } from "../src/lib/dinamica.ts";

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

describe("plano inclinado", () => {
  test("sin rozamiento: g sen θ (6 m/s² a 37°, 8 m/s² a 53°)", () => {
    assert.equal(aceleracionPlano(37), 6);
    assert.equal(aceleracionPlano(53), 8);
  });

  test("con rozamiento: g (sen θ − μ cos θ)", () => {
    assert.equal(aceleracionPlano(37, 0.25), 4);
    assert.equal(aceleracionPlano(53, 0.5), 5);
  });

  test("si μ ≥ tan θ el bloque no baja", () => {
    assert.equal(aceleracionPlano(37, 0.75), 0);
    assert.equal(aceleracionPlano(37, 0.9), 0);
  });
});

describe("sistemas de bloques", () => {
  test("máquina de Atwood: 6 kg y 2 kg aceleran a 5 m/s² con 30 N de tensión", () => {
    assert.deepEqual(atwood(6, 2), { a: 5, T: 30 });
  });

  test("bloque en la mesa lisa con pesa colgante: 5 kg y 5 kg → 5 m/s² y 25 N", () => {
    assert.deepEqual(mesaColgante(5, 5), { a: 5, T: 25 });
  });

  test("con rozamiento: 5 kg y 5 kg con μ = 0,2 → 4 m/s² y 30 N", () => {
    assert.deepEqual(mesaColgante(5, 5, 0.2), { a: 4, T: 30 });
  });

  test("si el rozamiento alcanza, el sistema no se mueve y la tensión iguala al peso colgado", () => {
    assert.deepEqual(mesaColgante(10, 2, 0.3), { a: 0, T: 20 });
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
