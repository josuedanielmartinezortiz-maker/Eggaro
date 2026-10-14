# Laboratorio de cinemáticas EGGARO

## Meta del primer prototipo

Construir un sistema propio de cinemáticas para navegador, que podamos ampliar sin depender de un editor comercial. Esta primera versión usa Three.js para dibujar la escena y JavaScript para controlar el tiempo, la cámara y el personaje de prueba.

## Cómo probarlo

Abre la página de GitHub Pages del repositorio. Pulsa **Iniciar cinemática**. Puedes pausar, reiniciar o arrastrar la línea de tiempo. En móvil se limita la resolución del renderizador para cuidar el rendimiento.

## Cómo está organizado

- `index.html`: interfaz y carga de módulos.
- `src/main.js`: escenario procedural, personaje de prueba, secuencia temporal y planos.
- `src/styles.css`: interfaz adaptable a pantallas pequeñas.
- `assets/`: lugar para modelos, audio y texturas creados o asistidos por IA.

## Ideas clave que estamos aprendiendo

1. **Escena:** objetos, luces, materiales y cámara.
2. **Tiempo de secuencia:** cada plano tiene un instante de inicio.
3. **Interpolación:** la cámara pasa de una posición a otra suavemente.
4. **Animación:** el movimiento se calcula a partir del tiempo de la secuencia.
5. **Controles de reproducción:** pausa, reinicio y búsqueda temporal.

## Próximas etapas

1. Separar la secuencia en datos JSON para editar planos sin modificar el motor.
2. Añadir pistas independientes para cámara, personajes, audio y texto.
3. Importar un personaje GLB con esqueleto y animaciones.
4. Incorporar audio, ambiente y transiciones.
5. Crear una interfaz de edición de planos.
6. Usar IA cuando convenga para concept art, texturas, música/ambiente con licencia adecuada o modelos de referencia. Los recursos generados deberán optimizarse y probarse en el móvil.

## Decisiones técnicas

Por ahora usamos JavaScript y Three.js porque GitHub Pages sirve archivos estáticos y los navegadores pueden ejecutarlos directamente. C++/WebAssembly se evaluará más adelante para módulos concretos si las mediciones muestran una necesidad real; no es automáticamente más rápido para renderizar esta escena. Java puede servir para herramientas auxiliares de creación o conversión de datos, no como código que el navegador ejecute directamente en Pages.

## Límites conocidos del prototipo

- El personaje es una figura geométrica provisional, no un rig de producción.
- Los árboles, la casa y el suelo se generan con geometría simple.
- No hay audio ni editor visual de keyframes todavía.
- La iluminación y sombras están limitadas deliberadamente para móviles.
