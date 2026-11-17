# Física 3D · prototipo (niveles 1 a 5)

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

## Nivel 4 · Cinemática II (caída libre y tiro parabólico)

| Etapa | Mecánica | Cómo se evalúa |
|---|---|---|
| 4.1 Caída libre | Poner la marca de altura (clic, arrastre o ↑ ↓) y lanzar: la pelota se suelta, sube o baja | La pelota llega a la marca (altura en t o altura máxima) |
| 4.2 Lanzamiento horizontal | Ajustar la rapidez con ↑ ↓ y disparar desde el acantilado | La pelota cae en la canasta (MRU + caída libre) |
| 4.3 Tiro parabólico | Ajustar la rapidez (ángulo fijo) o elegir el ángulo con ← → (30°, 37°, 45°, 53°, 60°) | Da en el blanco; 37° y 53° valen cuando dan el mismo alcance |
| 4.4 Examen tipo admisión | 10 preguntas; al responder, la escena se reproduce en 3D | Una sola oportunidad |

La escena de tiros (`src/three/tiro/EscenaTiro.tsx`) usa `src/lib/tiro.ts` (g = 10 m/s² y sen 37° = 0,6) y muestra estela estroboscópica, flechas de vₓ y v_y, torre o acantilado, cañón, canasta y marca de altura.

## Nivel 5 · Gráficas del movimiento

| Etapa | Mecánica | Cómo se evalúa |
|---|---|---|
| 5.1 Dibuja la x–t | Arrastrar los puntos de la x–t (o ← → para elegir y ↑ ↓ para mover) según el enunciado; el auto obedece a la gráfica junto a un fantasma con el movimiento correcto | Todos los puntos coinciden |
| 5.2 De x–t a v–t | Con la x–t dada, armar la v–t moviendo la barra de velocidad de cada tramo; un cursor recorre las dos gráficas | Cada barra = pendiente del tramo |
| 5.3 Área = desplazamiento | Calcular Δx en la v–t (↑ ↓); al correr, el área se pinta (verde arriba del eje, roja abajo) | Δx = área con signo |
| 5.4 Examen tipo admisión | 10 preguntas de x–t, v–t y a–t; el cursor recorre la gráfica al responder | Una sola oportunidad |

La escena de gráficas (`src/three/grafica/EscenaGrafica.tsx`) admite uno o dos paneles apilados, puntos o barras editables, áreas con signo, una pista con el auto y un cursor de tiempo; las cuentas viven en `src/lib/graficas.ts`.

## Responsive

- **Móvil vertical / tablet:** escena arriba y enunciado debajo; en el inicio el 3D del nivel aparece apilado si hay altura, y la página hace scroll si no cabe.
- **Móvil horizontal:** escena a la izquierda y enunciado a la derecha con su propio scroll.
- **Escritorio angosto (≤ 1400 px):** la escena empieza a la derecha del enunciado; sin espacio, el ejercicio siguiente del carrusel se oculta.
- **Laptops bajas:** teclado y respuesta más compactos.
- **2K / 4K:** la interfaz HTML escala con `zoom` (el canvas 3D se adapta solo).

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
