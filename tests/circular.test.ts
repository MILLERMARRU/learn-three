// ══ Pruebas del movimiento circunferencial: MCU, transmisión, aceleración centrípeta y formato con π ───────
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { aCentripeta, angulo, fmtPi, fmtRadPi, frecuencia, grados, omegaDeRpm, omegaTransmitida, periodo, radioConAceleracion, vMaxCurva, vTangencial } from "../src/lib/circular.ts";

const PI = Math.PI;
const cerca = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

describe("MCU", () => {
  test("θ = ωt: π/2 rad/s durante 2 s gira π rad (180°)", () => {
    cerca(angulo(PI / 2, 2), PI);
    cerca(grados(angulo(PI / 2, 2)), 180);
  });

  test("periodo y frecuencia: con ω = π rad/s una vuelta tarda 2 s", () => {
    cerca(periodo(PI), 2);
    cerca(frecuencia(PI), 0.5);
  });

  test("60 rpm son 2π rad/s y 30 rpm son π rad/s", () => {
    cerca(omegaDeRpm(60), 2 * PI);
    cerca(omegaDeRpm(30), PI);
  });

  test("v = ωR: 4 rad/s en un radio de 0,5 m da 2 m/s", () => {
    assert.equal(vTangencial(4, 0.5), 2);
  });
});

describe("transmisión y aceleración centrípeta", () => {
  test("faja: la rueda de la mitad de radio gira el doble de rápido", () => {
    assert.equal(omegaTransmitida(6, 10, 5), 12);
    assert.equal(omegaTransmitida(6, 10, 30), 2);
  });

  test("a꜀ = v² / R: 20 m/s en una curva de 40 m da 10 m/s²", () => {
    assert.equal(aCentripeta(20, 40), 10);
  });

  test("rapidez máxima en una curva: con a_máx = 10 m/s² y R = 90 m, 30 m/s", () => {
    assert.equal(vMaxCurva(10, 90), 30);
    assert.equal(vMaxCurva(0.4 * 10, 100), 20);
  });

  test("al doble de la rapidez máxima la curva que logra es 4 veces más abierta", () => {
    assert.equal(radioConAceleracion(40, 10), 160);
    assert.equal(radioConAceleracion(40, 10) / radioConAceleracion(20, 10), 4);
  });
});

describe("formato con π", () => {
  test("simplifica la fracción", () => {
    assert.equal(fmtPi(1, 4), "π/4");
    assert.equal(fmtPi(2, 4), "π/2");
    assert.equal(fmtPi(4, 4), "π");
    assert.equal(fmtPi(6, 4), "3π/2");
    assert.equal(fmtPi(8, 4), "2π");
    assert.equal(fmtPi(10, 4), "5π/2");
  });

  test("cero, negativos y numeradores fraccionarios", () => {
    assert.equal(fmtPi(0, 4), "0");
    assert.equal(fmtPi(-2, 4), "−π/2");
    assert.equal(fmtPi(1.5, 4), "3π/8");
  });

  test("radianes como múltiplo decimal de π", () => {
    assert.equal(fmtRadPi(1.25 * PI), "1,25π");
    assert.equal(fmtRadPi(2 * PI), "2π");
    assert.equal(fmtRadPi(0), "0");
  });
});
