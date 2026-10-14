# Laboratorio de cinemáticas EGGARO

## Estado del prototipo

La secuencia continúa usando Three.js y JavaScript para ejecutarse directamente en GitHub Pages. Esta revisión corrige el encuadre de cámara, la progresión de planos, el formato móvil y el coste de dibujar el escenario.

## Cambios realizados

- Se reorganizaron los keyframes para que los objetivos de cámara estén cerca de la acción, en vez de apuntar detrás del personaje.
- La presentación, el seguimiento y el plano final ahora usan trayectorias coordinadas con el movimiento del personaje.
- Se ajustó el campo de visión en pantallas verticales.
- Los árboles y las flores usan `THREE.InstancedMesh`: conservan variaciones de tamaño/color sin crear cientos de mallas independientes.
- Se redujo el coste de sombras y resolución en móviles.
- Se corrigió el reinicio desde el final y el estado de reproducción al arrastrar la línea de tiempo.

## Probar

1. Abre GitHub Pages y recarga la página.
2. Pulsa **Iniciar cinemática**.
3. Prueba pausa, reinicio y la barra de tiempo.
4. En el teléfono, prueba orientación vertical y horizontal.

## Arquitectura

- `index.html`: interfaz y carga de módulos.
- `src/main.js`: escenario procedural, instancias, cámara, personaje y reloj de secuencia.
- `src/styles.css`: interfaz adaptable.
- `assets/`: futuro espacio para modelos, texturas y audio.

## Por qué no se añadió C++ en esta corrección

El problema principal era de composición de cámara y de exceso de mallas separadas, no de cálculos matemáticos pesados. C++ tendría que compilarse a WebAssembly y requeriría un flujo de compilación/carga; no arreglaría por sí mismo el encuadre. Primero conviene medir el rendimiento de esta versión. Si aparece un cálculo costoso concreto, se podrá probar un módulo WASM aislado sin reemplazar la arquitectura web.

## Límites pendientes

- El personaje sigue siendo una figura geométrica provisional, no un modelo riggeado de producción.
- No hay audio, actuación facial, animación esquelética ni editor visual de keyframes.
- La mejora de rendimiento debe comprobarse en el teléfono objetivo; no se ha afirmado una cifra de FPS sin medirla.
