# Laboratorio de cinemáticas EGGARO

## Objetivo

Laboratorio web basado en Three.js, conservando el arranque sencillo de GitHub Pages y usando los diseños originales de Mike y Micaela del repositorio GAMERPRO GAME.

## Cambios de esta etapa

- Carga los modelos originales `3D/mike.glb` y `3D/micaela.glb`, normaliza su altura y los coloca sobre una trayectoria común.
- Si los GLB contienen animaciones, reproduce un clip mediante `AnimationMixer`; añade un movimiento secundario discreto para evitar una pose estática.
- Cámara, objetivo y personajes usan interpolación Hermite cúbica con tangentes temporales, reduciendo los frenados bruscos en cada keyframe.
- Árboles y flores siguen usando `THREE.InstancedMesh` para reducir llamadas de dibujo.
- El muñeco geométrico permanece como respaldo mientras no cargue ninguno de los modelos originales.

## Probar

1. Abre [EGGARO Pages](https://josuedanielmartinezortiz-maker.github.io/Eggaro/) con conexión a internet.
2. Espera a que carguen los modelos externos y pulsa **Iniciar cinemática**.
3. Prueba pausa, reinicio, línea de tiempo y orientación vertical/horizontal.

## Arquitectura

- `index.html`: interfaz y carga de módulos.
- `src/main.js`: escena, carga GLB, cámara, animación y reloj.
- `src/styles.css`: interfaz adaptable.
- Los GLB se mantienen en el repositorio original `Game/3D/` para no duplicar archivos grandes.

## Rendimiento y C++

Esta etapa se centra en interpolación temporal, reutilización de instancias y modelos existentes. C++/WebAssembly no se añade porque no hay un cálculo pesado medido que lo justifique; no sustituiría la necesidad de mejorar trayectorias y animaciones.

## Límites pendientes

- Los modelos se descargan de otro repositorio y necesitan conexión; si falla la descarga, se registra el error y permanece el respaldo geométrico.
- La fluidez final debe probarse en el teléfono objetivo; falta medir FPS y revisar visualmente la orientación real de los modelos.
- Si los GLB no contienen clips de caminata, el movimiento secundario actual no reemplaza una animación esquelética de caminar; habrá que retargetear una animación compatible.
