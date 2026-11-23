# Guía de contribución

¡Gracias por tu interés en **Learn Three**! Es un proyecto colaborativo para que la física y las matemáticas preuniversitarias se aprendan **haciendo**: cada tema es un nivel con escenas 3D interactivas. Hoy está en marcha el curso de **Física**, y después vienen **Aritmética, Álgebra, Geometría y Trigonometría**. Esta guía explica cómo sumarte, cómo trabajamos y qué revisamos antes de integrar un cambio.

> **¿Es tu primera contribución a un proyecto open source?** No hay problema: la guía va paso a paso y los issues con la etiqueta [`good first issue`](https://github.com/MILLERMARRU/learn-three/issues?q=is%3Aopen+label%3A%22good+first+issue%22) están pensados para empezar.

## Contenido

1. [Formas de contribuir](#1-formas-de-contribuir)
2. [Antes de empezar](#2-antes-de-empezar)
3. [Flujo de trabajo con fork](#3-flujo-de-trabajo-con-fork)
4. [Ramas y commits](#4-ramas-y-commits)
5. [Estilo de código](#5-estilo-de-código)
6. [Contenido educativo](#6-contenido-educativo)
7. [Cómo añadir un nivel](#7-cómo-añadir-un-nivel)
8. [Antes de abrir el pull request](#8-antes-de-abrir-el-pull-request)
9. [Revisión e integración](#9-revisión-e-integración)
10. [Reportar errores y proponer ideas](#10-reportar-errores-y-proponer-ideas)
11. [Convivencia](#11-convivencia)

---

## 1. Formas de contribuir

No hace falta ser experto en 3D, física ni matemáticas: hay trabajo para distintos perfiles.

| Perfil | Ejemplos de aporte |
|---|---|
| **Frontend (React / TypeScript)** | Etapas nuevas, mejoras del HUD, accesibilidad, rendimiento, pruebas |
| **3D (three.js / React Three Fiber)** | Escenas nuevas, animaciones, materiales, optimización |
| **Física o matemáticas / docencia** | Proponer niveles y cursos, redactar problemas propios, revisar explicaciones |
| **Diseño / UX** | Flujo de las etapas, legibilidad, móvil |
| **QA** | Probar en dispositivos y navegadores, reportar errores reproducibles |
| **Documentación** | README, guías y comentarios del código |

## 2. Antes de empezar

1. **Requisitos:** Node.js 22.12 o superior (recomendado 24), npm y Git.
2. **Busca o abre un issue.** Todo cambio parte de un issue:
   - si ya existe, **comenta que lo tomas** (por ejemplo, «Me encargo de este») para que se te asigne y nadie duplique trabajo;
   - si es una idea nueva, **abre un issue primero** con la plantilla adecuada y espera una respuesta antes de invertir mucho tiempo.
3. **Un issue a la vez.** Termina (o libera) uno antes de tomar otro. Si en una semana no hay avances, el issue puede reasignarse; avisa si necesitas más tiempo.

## 3. Flujo de trabajo con fork

Trabajamos con **forks y pull requests**. Nadie sube cambios directamente a `main`.

### 3.1 Preparación (una sola vez)

```bash
# 1. En GitHub, pulsa «Fork» en https://github.com/MILLERMARRU/learn-three
# 2. Clona TU fork
git clone https://github.com/<tu-usuario>/learn-three.git
cd learn-three

# 3. Conecta el repositorio original como «upstream»
git remote add upstream https://github.com/MILLERMARRU/learn-three.git
git remote -v   # origin = tu fork · upstream = repositorio original

# 4. Instala y levanta el proyecto
npm ci
npm run dev     # http://localhost:5173
```

### 3.2 Por cada issue

```bash
# 1. Parte siempre de un main actualizado
git checkout main
git pull upstream main

# 2. Crea una rama con el número del issue
git checkout -b feat/7-nivel-6-circunferencial

# 3. Trabaja y haz commits pequeños (ver sección 4)
git add src/contenido/nivel-06/circular.tsx
git commit -m "feat(nivel-6): agrega problemas de velocidad angular"

# 4. Antes de subir, trae lo último de upstream
git fetch upstream
git rebase upstream/main          # resuelve conflictos si los hay

# 5. Sube la rama a TU fork
git push -u origin feat/7-nivel-6-circunferencial
```

### 3.3 Abrir el pull request

1. En GitHub, abre un **pull request** desde `tu-usuario/learn-three:tu-rama` hacia `MILLERMARRU/learn-three:main`.
2. Completa la plantilla y escribe **`Cierra #7`** (con el número de tu issue) para enlazarlos.
3. Si el cambio es visual, adjunta **capturas o un GIF** de escritorio y de móvil.
4. Si aún no está listo, ábrelo como **borrador** (*Draft*) para recibir comentarios temprano.

### 3.4 Después del merge

```bash
git checkout main
git pull upstream main
git push origin main                    # mantiene tu fork al día
git branch -d feat/7-nivel-6-circunferencial
```

## 4. Ramas y commits

### Nombres de rama

`tipo/<número-de-issue>-descripcion-corta`, en minúsculas y con guiones:

| Tipo | Uso |
|---|---|
| `feat/` | Funcionalidad nueva (niveles, etapas, escenas) |
| `fix/` | Corrección de errores |
| `docs/` | Documentación |
| `refactor/` | Cambios internos sin cambiar el comportamiento |
| `style/` | Estilos y CSS |
| `test/` | Pruebas |
| `build/` · `ci/` | Dependencias, Docker, integración continua |

### Mensajes de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/) **en español**, en imperativo y en minúscula:

```
tipo(ámbito): qué hace el cambio
```

```
feat(nivel-6): agrega etapa 6.1 Velocidad angular
fix(3d): evita que las etiquetas parpadeen al actualizarse
docs: explica cómo añadir un hero de nivel
style(inicio): ajusta el carrusel en móvil horizontal
```

- **Commits pequeños y atómicos:** idealmente un archivo o un cambio lógico por commit. Facilita la revisión y permite revertir con precisión.
- No mezcles cambios de formato con cambios de lógica en el mismo commit.
- Ámbitos frecuentes: `nivel-N`, `3d`, `ui`, `motor`, `lib`, `inicio`, `etapas`, `contenido`.

## 5. Estilo de código

- **TypeScript estricto.** Componentes funcionales y hooks. Nada de `any` sin justificación.
- **Español en todo el dominio:** nombres de componentes, variables y comentarios (`EscenaPista`, `alTerminar`, `pedirPista`).
- **Comentarios en español** y separadores de sección con este formato:
  ```ts
  // ══ Título de la sección ───────
  ```
- **Importaciones con el alias `@/`**, que apunta a `src/` (por ejemplo, `import { G } from "@/lib/tiro"`).
- **Estilos en `src/index.css`**, usando los tokens de `:root` (`--accent`, `--ink`, `--line`…). Las reglas responsive van al final del archivo.
- **Sin dependencias nuevas sin acordarlo.** El proyecto se mantiene ligero: `react`, `three` y `@react-three/fiber`. Si necesitas una librería, propónla primero en el issue.
- **3D con primitivas.** Construye las escenas con geometrías de three.js, sin modelos pesados. Libera geometrías y materiales en el `useEffect` de limpieza.
- **Física consistente.** Usa `g = 10 m/s²` y los ángulos notables del curso (`senCos()` de `src/lib/tiro.ts`: sen 37° = 0,6), para que la simulación coincida con las respuestas.
- **Etiquetas 3D con `<Etiqueta>`.** Para números que cambian, usa spans con `className="etq-num"` y actualízalos desde `useFrame`, sin re-renderizar React.
- **Accesibilidad básica:** botones con `aria-label` si no tienen texto, foco visible y que todo se pueda hacer con el teclado.

## 6. Contenido educativo

- **Problemas propios.** Los libros solo sirven como temario y para calibrar la dificultad. **No copies enunciados ni subas PDFs o imágenes de terceros.**
- **Números que den resultados exactos.** Elige datos para que las respuestas sean limpias, como 37°, 45° y múltiplos de 5.
- **Tres rondas por etapa:** *guiado* (con fantasma y tecla resaltada), *pista* (con la fórmula visible) y *solo*.
- **Dos o tres pistas en escalera** por ejercicio: de la idea general al cálculo.
- **Retroalimentación que enseñe:** si el estudiante falla, dile qué pasó («Cayó a 15 m; la canasta está a 60 m»), no solo «incorrecto».
- **Examen de 10 preguntas** con explicación breve en cada una y, si se puede, una escena 3D que se reproduzca al responder.

## 7. Cómo añadir un nivel

Sigue la plantilla de los niveles existentes; el más completo de referencia es `nivel-05`.

1. **Contenido:** `src/contenido/nivel-0N/*.tsx` (rondas de cada etapa) y `examen.tsx`.
2. **Escena 3D:** `src/three/<tema>/Escena*.tsx`, con la prop `previa` para el carrusel.
3. **Etapas:** `src/etapas/nivel-0N/` con `useEtapa()` + `<CascaronEtapa>` + `<CarruselItems>`. El examen usa `<Examen>`.
4. **Registro:**
   - `ETAPAS_N` y `ETAPAS_POR_NIVEL` en `src/contenido/curso.ts`;
   - las rutas en `src/App.tsx`;
   - las ilustraciones de las tarjetas en `VisualEtapa` de `src/paginas/Mapa.tsx`.
5. **Hero del inicio:** `src/paginas/hero/<tema>.tsx` y su registro en `HEROES` de `HeroNivel.tsx`.
6. **Documentación:** agrega el nivel a la tabla del README.

Un nivel completo es un cambio grande. **Divídelo en varios PRs**, por ejemplo: contenido + escena, luego cada etapa y al final el examen y el hero.

## 8. Antes de abrir el pull request

Revisa esta lista. Los PRs que la cumplen se revisan mucho más rápido.

> La **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) repite automáticamente los tres primeros puntos y construye la imagen Docker en cada PR, incluso en los que vienen de forks. Un PR con la CI en rojo no se integra.

- [ ] `npx tsc -b` pasa sin errores.
- [ ] `npm run build` termina correctamente.
- [ ] `npm run lint` no agrega avisos nuevos.
- [ ] Probado en escritorio (≈ 1440 × 900) y en móvil (DevTools ≈ 390 × 844).
- [ ] La consola del navegador no muestra errores.
- [ ] Los cambios visuales incluyen capturas o GIF.
- [ ] La descripción enlaza el issue (`Cierra #N`) y explica cómo probarlo.
- [ ] Los commits siguen la convención y la rama está al día con `upstream/main`.

## 9. Revisión e integración

- `main` está protegida: **todo cambio entra por pull request y necesita una revisión aprobada**. Si agregas commits después de la aprobación, hay que volver a aprobar, y todas las conversaciones deben quedar resueltas.
- Los comentarios de la revisión son sobre el código, nunca sobre la persona.
- Responde a cada comentario: con un commit que lo resuelva o con una explicación si no estás de acuerdo.
- Cuando el PR está aprobado, se integra con **merge commit** (no *squash*) para conservar los commits atómicos.
- Si tu PR queda sin actividad varias semanas, podemos cerrarlo; siempre podrás reabrirlo.

## 10. Reportar errores y proponer ideas

Usa las plantillas de [Issues](https://github.com/MILLERMARRU/learn-three/issues/new/choose):

- **Reporte de error:** pasos para reproducirlo, qué esperabas, qué pasó, dispositivo, navegador y tamaño de pantalla, con una captura si es posible.
- **Propuesta de mejora:** el problema que resuelve y la idea de solución.
- **Propuesta de nivel o etapa:** el tema, la mecánica interactiva y cómo se evalúa.

¿Tienes dudas? Comenta en el [issue de bienvenida](https://github.com/MILLERMARRU/learn-three/issues/14) (fijado en el repositorio) o abre uno con la etiqueta `question`.

## 11. Convivencia

Queremos un espacio donde aprender sea cómodo para todos:

- Trata a las demás personas con respeto y paciencia, sin importar su nivel de experiencia.
- Da y recibe la crítica con buena fe: sobre ideas y código, de forma concreta y constructiva.
- Pide ayuda cuando la necesites. Preguntar también es contribuir.

Los comportamientos irrespetuosos no se toleran y pueden suponer la exclusión del proyecto.

## Licencia de las contribuciones

El proyecto usa la [licencia MIT](LICENSE). Al abrir un pull request confirmas que el aporte es tuyo (o que tienes derecho a compartirlo) y aceptas que se publique bajo esa licencia.

---

¡Gracias por sumar tu tiempo y tu talento a Learn Three! 🧪
