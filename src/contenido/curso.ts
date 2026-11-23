// ══ Estructura del curso ───────
export interface EtapaInfo {
  id: string;
  clave: string;
  numero: string;
  titulo: string;
  resumen: string;
  tipo: string;
}

export const ETAPAS_N1: EtapaInfo[] = [
  { id: "moleculas", clave: "n1-moleculas", numero: "1.1", titulo: "Moléculas dimensionales", resumen: "Escribe la ecuación dimensional y mírala armarse en 3D.", tipo: "Teclado" },
  { id: "balanza", clave: "n1-balanza", numero: "1.2", titulo: "Balanza de homogeneidad", resumen: "Equilibra la ecuación: todos los sumandos deben pesar igual.", tipo: "Teclado + 3D" },
  { id: "laboratorio", clave: "n1-laboratorio", numero: "1.3", titulo: "Laboratorio de fórmulas", resumen: "Experimenta con péndulos y ondas, y descubre los exponentes.", tipo: "Flechas + mouse" },
  { id: "examen", clave: "n1-examen", numero: "1.4", titulo: "Examen tipo admisión", resumen: "10 preguntas con tiempo, una sola oportunidad cada una.", tipo: "Opción múltiple" },
];

export const ETAPAS_N2: EtapaInfo[] = [
  { id: "componentes", clave: "n2-componentes", numero: "2.1", titulo: "Arma el vector", resumen: "Coloca la punta del vector con el mouse: componentes, módulo y ángulo.", tipo: "Mouse + flechas" },
  { id: "suma", clave: "n2-suma", numero: "2.2", titulo: "Suma de vectores", resumen: "Encadena vectores (método del polígono) y ubica la resultante.", tipo: "Mouse + flechas" },
  { id: "paralelogramo", clave: "n2-paralelogramo", numero: "2.3", titulo: "Regla del paralelogramo", resumen: "Ley de cosenos: calcula la resultante y escríbela.", tipo: "Teclado numérico" },
  { id: "examen", clave: "n2-examen", numero: "2.4", titulo: "Examen tipo admisión", resumen: "10 preguntas de vectores con tiempo.", tipo: "Opción múltiple" },
];

export const ETAPAS_N3: EtapaInfo[] = [
  { id: "prediccion", clave: "n3-prediccion", numero: "3.1", titulo: "Predice la posición", resumen: "MRU: pon la bandera donde estará el auto y míralo correr.", tipo: "Mouse + flechas" },
  { id: "encuentro", clave: "n3-encuentro", numero: "3.2", titulo: "Encuentro y alcance", resumen: "Dos autos: ¿dónde se juntan? Pon la bandera y compruébalo.", tipo: "Mouse + flechas" },
  { id: "frenado", clave: "n3-frenado", numero: "3.3", titulo: "Frena a tiempo", resumen: "MRUV: ajusta la aceleración para frenar justo o llegar a la meta.", tipo: "Flechas ↑ ↓" },
  { id: "examen", clave: "n3-examen", numero: "3.4", titulo: "Examen tipo admisión", resumen: "10 preguntas de MRU y MRUV con la escena en 3D.", tipo: "Opción múltiple" },
];

export const ETAPAS_N4: EtapaInfo[] = [
  { id: "caida", clave: "n4-caida", numero: "4.1", titulo: "Caída libre", resumen: "Pon la marca donde estará la pelota: sube, frena y vuelve a caer.", tipo: "Mouse + flechas" },
  { id: "horizontal", clave: "n4-horizontal", numero: "4.2", titulo: "Lanzamiento horizontal", resumen: "Ajusta la rapidez para encestar desde lo alto del acantilado.", tipo: "Flechas ↑ ↓" },
  { id: "parabolico", clave: "n4-parabolico", numero: "4.3", titulo: "Tiro parabólico", resumen: "Rapidez o ángulo: da en el blanco con 37°, 45° y 53°.", tipo: "Flechas" },
  { id: "examen", clave: "n4-examen", numero: "4.4", titulo: "Examen tipo admisión", resumen: "10 preguntas de caída libre y proyectiles con la escena en 3D.", tipo: "Opción múltiple" },
];

export const ETAPAS_N5: EtapaInfo[] = [
  { id: "dibuja", clave: "n5-dibuja", numero: "5.1", titulo: "Dibuja la x–t", resumen: "Arrastra los puntos de la gráfica y el auto obedece a lo que dibujas.", tipo: "Mouse + flechas" },
  { id: "velocidad", clave: "n5-velocidad", numero: "5.2", titulo: "De x–t a v–t", resumen: "La pendiente de cada tramo es la altura de su barra de velocidad.", tipo: "Mouse + flechas" },
  { id: "area", clave: "n5-area", numero: "5.3", titulo: "Área = desplazamiento", resumen: "Calcula el área bajo la v–t y mírala pintarse mientras el auto avanza.", tipo: "Flechas ↑ ↓" },
  { id: "examen", clave: "n5-examen", numero: "5.4", titulo: "Examen tipo admisión", resumen: "10 preguntas de gráficas x–t, v–t y a–t con la gráfica en 3D.", tipo: "Opción múltiple" },
];

export const ETAPAS_N6: EtapaInfo[] = [
  { id: "angular", clave: "n6-angular", numero: "6.1", titulo: "Velocidad angular", resumen: "Ajusta ω para que la marca de la rueda llegue a la meta: θ = ωt.", tipo: "Flechas ↑ ↓" },
  { id: "poleas", clave: "n6-poleas", numero: "6.2", titulo: "Poleas y engranajes", resumen: "Fajas, engranajes y ejes: sincroniza la última rueda con ωA·RA = ωB·RB.", tipo: "Flechas ↑ ↓" },
  { id: "curva", clave: "n6-curva", numero: "6.3", titulo: "Aceleración centrípeta", resumen: "¿A qué rapidez se sale el auto de la curva? a꜀ = v²/R no puede pasar de a máx.", tipo: "Flechas ↑ ↓" },
  { id: "examen", clave: "n6-examen", numero: "6.4", titulo: "Examen tipo admisión", resumen: "10 preguntas de MCU, transmisión y aceleración centrípeta con la escena en 3D.", tipo: "Opción múltiple" },
];

/** Etapas de cada nivel disponible (la clave es el número de nivel). */
export const ETAPAS_POR_NIVEL: Record<number, EtapaInfo[]> = { 1: ETAPAS_N1, 2: ETAPAS_N2, 3: ETAPAS_N3, 4: ETAPAS_N4, 5: ETAPAS_N5, 6: ETAPAS_N6 };

/** Primera etapa sin terminar de todo el curso (para el botón "Continuar"). */
export function siguienteEtapa(hechas: (clave: string) => boolean): { nivel: number; etapa: EtapaInfo } {
  for (const [n, etapas] of Object.entries(ETAPAS_POR_NIVEL)) {
    const e = etapas.find((x) => !hechas(x.clave));
    if (e) return { nivel: Number(n), etapa: e };
  }
  return { nivel: 1, etapa: ETAPAS_N1[0] };
}

export const NIVELES_FISICA = [
  "Análisis dimensional",
  "Análisis vectorial",
  "Cinemática I · MRU y MRUV",
  "Cinemática II · Caída libre y tiro parabólico",
  "Gráficas del movimiento",
  "Movimiento circunferencial",
  "Estática",
  "Dinámica",
  "Gravitación universal",
  "Trabajo, energía y potencia",
  "Cantidad de movimiento y choques",
  "Oscilaciones (MAS)",
  "Ondas mecánicas",
  "Hidrostática",
  "Calor",
  "Termodinámica",
  "Electrostática",
  "Electrodinámica",
  "Condensadores",
  "Electromagnetismo",
  "Ondas electromagnéticas",
  "Óptica",
  "Física moderna",
];

export const OTROS_CURSOS = ["Aritmética", "Álgebra", "Geometría", "Trigonometría"];

// ══ Lo que se hará en cada nivel (se muestra en el carrusel) ───────
export const TEASERS = [
  "Arma moléculas de dimensiones, equilibra ecuaciones y descubre fórmulas experimentando.",
  "Arrastra flechas en 3D, súmalas y descomponlas hasta formar la resultante.",
  "Predice dónde estará el móvil y míralo correr para comprobarlo.",
  "Apunta, calcula y acierta al blanco con tiros parabólicos.",
  "Dibuja la gráfica con el mouse y mira el movimiento que produce.",
  "Ruedas, poleas y órbitas: velocidad angular a mano.",
  "Equilibra cuerpos colocando fuerzas y torques.",
  "Diagramas de cuerpo libre en planos inclinados.",
  "Lanza satélites y ajusta su órbita.",
  "Montañas rusas donde la energía se conserva (o no).",
  "Choques en una mesa de billar 3D.",
  "Resortes y péndulos que oscilan a tu ritmo.",
];
