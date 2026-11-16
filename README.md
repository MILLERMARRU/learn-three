# Física 3D · prototipo (niveles 1, 2 y 3)

Aprende física moviéndola: cada tema es un nivel con escenas 3D que se manejan con teclado y mouse.

## Ejecutar

```
npm install
npm run dev        → http://localhost:5173
npm run build      → producción (carpeta dist/)
```

Dependencias: `react`, `react-dom`, `three` y `@react-three/fiber`. Nada más.

## Nivel 1 · Análisis dimensional

| Etapa | Mecánica | Cómo se evalúa |
|---|---|---|
| 1.1 Moléculas dimensionales | Escribir la ecuación dimensional (`MLT-2`) y verla armarse con objetos 3D (regla, pesa, reloj de arena…) | Texto convertido a exponentes y comparado |
| 1.2 Balanza de homogeneidad | Escribir la dimensión de la incógnita hasta nivelar la balanza | El término debe igualar al de referencia |
| 1.3 Laboratorio de fórmulas | Ajustar exponentes con flechas mientras se experimenta con − + y M (péndulo, caída, circular, onda) | Sistema de ecuaciones por base (M, L, T) |
| 1.4 Examen tipo admisión | Opción múltiple A–E con 45 s y vista previa 3D | Una sola oportunidad |

## Nivel 2 · Análisis vectorial

| Etapa | Mecánica | Cómo se evalúa |
|---|---|---|
| 2.1 Arma el vector | Clic, arrastre o flechas para colocar la punta en la cuadrícula; componentes y luego módulo + ángulo (37°, 53°, 45°) | Punta en el punto exacto |
| 2.2 Suma de vectores | Ubicar la punta de R = A + B (+ C) o A − B con el método del polígono | Punta en el punto exacto (incluye polígono cerrado, R = 0) |
| 2.3 Regla del paralelogramo | Escribir el módulo de R (ley de cosenos, resultante máxima y mínima) | Valor numérico con tolerancia |
| 2.4 Examen tipo admisión | 10 preguntas con los vectores dibujados en 3D | Una sola oportunidad |

## Nivel 3 · Cinemática I (MRU y MRUV)

| Etapa | Mecánica | Cómo se evalúa |
|---|---|---|
| 3.1 Predice la posición | Poner la bandera en la pista (clic, arrastre o ← →) y pulsar Enter: el auto corre en MRU | El auto se detiene en la bandera (x = x₀ + v·t) |
| 3.2 Encuentro y alcance | Dos autos: bandera donde se juntan; Enter y corren | Punto de encuentro/alcance exacto |
| 3.3 Frena a tiempo | Ajustar la aceleración con ↑ ↓ y correr: frenar antes del muro, cruzar la meta a cierta rapidez o llegar a la marca a tiempo | La simulación lo comprueba (choque, rapidez o distancia) |
| 3.4 Examen tipo admisión | 10 preguntas; al responder, la escena se reproduce en 3D | Una sola oportunidad |

La pista (`src/three/pista/EscenaPista.tsx`) simula MRU/MRUV con cronómetro, muros, metas y bandera arrastrable; sirve para los niveles de gráficas y caída libre.

Todas las etapas: rondas **1 Guiado → 2 Pista → 3 Solo**, pistas que restan puntos, estrellas guardadas en `localStorage`, HUD sin panel (enunciado flotante, estadísticas, teclado virtual) y **carrusel 3D**: el siguiente ejercicio espera a la derecha y entra al centro al acertar.

## Estructura (la plantilla para los demás niveles)

```
src/
  motor/etapa.ts            ← rondas, pistas, puntos, estrellas, estadísticas, lista para el carrusel
  motor/useEntradaDim.ts    ← entrada por teclado de dimensiones
  motor/useEntradaNumero.ts ← entrada numérica con tolerancia
  ui/CascaronEtapa.tsx      ← HUD: barra superior, enunciado, respuesta central, teclado, transiciones
  ui/TecladoVirtual.tsx     ← teclado en pantalla (resalta la siguiente tecla)
  three/Escenario.tsx       ← canvas, luces, encuadre, balanceo y giro con el mouse
  three/CarruselItems.tsx   ← carrusel 3D de ejercicios
  three/vectores/           ← flecha 3D, plano cartesiano interactivo, paralelogramo
  three/…                   ← piezas, moléculas, balanza, escenas de laboratorio
  contenido/nivel-0N/       ← el contenido como datos (problemas propios)
  etapas/                   ← una etapa = contenido + escena + panel (etapas/Examen.tsx es genérico)
```

### Añadir un nivel nuevo

1. Crear `src/contenido/nivel-0N/*.tsx` con los ítems de cada ronda (`RondaDef<T>[]`).
2. Crear la escena 3D en `src/three/` (primitivas de three.js, sin modelos pesados) con un modo de vista previa para el carrusel.
3. Crear las etapas en `src/etapas/nivel-0N/` con `useEtapa()` + `<CascaronEtapa>` + `<CarruselItems>`; el examen usa `<Examen>`.
4. Registrar las rutas en `src/App.tsx` y las etapas en `ETAPAS_POR_NIVEL` de `src/contenido/curso.ts`.

Los libros de referencia solo sirven como temario: los enunciados son propios.

## Despliegue en Dokploy

El repo trae un `Dockerfile` multi-etapa (Node compila con Vite → nginx sirve `dist/`) y `nginx.conf` con gzip, caché larga para `/assets/` y chequeo de salud en `/salud`.

1. En Dokploy: **Create Application** → proveedor **GitHub** (conectar la GitHub App si el repo es privado) → repo `fisica-3d`, rama `main`.
2. **Build Type:** `Dockerfile` · **Dockerfile Path:** `Dockerfile` · **Docker Context Path:** `.`
3. **Deploy**.
4. **Domains:** generar o asignar dominio con **Container Port `80`** (HTTPS con Let's Encrypt si es dominio propio).

No necesita variables de entorno. Para probar la imagen en local:

```
docker build -t fisica-3d .
docker run --rm -p 8080:80 fisica-3d   → http://localhost:8080
```
