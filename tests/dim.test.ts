// ══ Pruebas del álgebra de dimensiones y del parseo de lo que escribe el alumno ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { canonica, diagnostico, div, esAdimensional, formato, fraccion, iguales, mul, parsear, pot, teclaACaracter } from "../src/lib/dim.ts";

const VELOCIDAD = { L: 1, T: -1 };
const FUERZA = { M: 1, L: 1, T: -2 };

describe("operaciones", () => {
  test("velocidad = longitud / tiempo", () => {
    assert.deepEqual(div({ L: 1 }, { T: 1 }), VELOCIDAD);
  });

  test("fuerza = masa · aceleración", () => {
    assert.deepEqual(mul({ M: 1 }, { L: 1, T: -2 }), FUERZA);
  });

  test("potencias y comparación", () => {
    assert.deepEqual(pot(VELOCIDAD, 2), { L: 2, T: -2 });
    assert.equal(iguales(FUERZA, { T: -2, L: 1, M: 1 }), true);
    assert.equal(esAdimensional(div(FUERZA, FUERZA)), true);
  });
});

describe("texto canónico y formato", () => {
  test("canónica para teclear", () => {
    assert.equal(canonica(FUERZA), "MLT-2");
    assert.equal(canonica({}), "1");
  });

  test("formato con superíndices", () => {
    assert.equal(formato(FUERZA), "MLT⁻²");
  });

  test("exponentes fraccionarios legibles", () => {
    assert.equal(fraccion(2), "2");
    assert.equal(fraccion(0.5), "½");
    assert.equal(fraccion(-1.5), "−3⁄2");
  });
});

describe("parsear", () => {
  test("una dimensión completa es válida", () => {
    const p = parsear("MLT-2");
    assert.deepEqual(p.dim, FUERZA);
    assert.equal(p.valido, true);
  });

  test("un exponente a medias no es válido", () => {
    assert.equal(parsear("LT-").valido, false);
  });

  test("«1» es adimensional", () => {
    const p = parsear("1");
    assert.equal(p.adimensional, true);
    assert.equal(p.valido, true);
  });

  test("vacío", () => {
    assert.equal(parsear("").vacio, true);
  });
});

describe("teclado y diagnóstico", () => {
  test("las teclas se traducen a bases", () => {
    assert.equal(teclaACaracter("m"), "M");
    assert.equal(teclaACaracter("q"), "θ");
    assert.equal(teclaACaracter("x"), null);
  });

  test("dice qué falta y qué sobra", () => {
    const msgs = diagnostico({ M: 1, L: 1 }, FUERZA);
    assert.equal(msgs.length, 1);
    assert.match(msgs[0], /^Falta T/);
    assert.deepEqual(diagnostico({ M: 1, L: 1, T: -2, I: 1 }, FUERZA), ["Te sobra I"]);
  });
});
