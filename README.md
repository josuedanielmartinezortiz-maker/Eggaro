# GAMERPRO GAME

Nueva base del proyecto gráfico 3D de GAMERPRO GAME.

## Sistema central de pollos, huevos y fusiones

La lógica oficial quedó separada en `sistemas/ChickenSystem.js`: 18 tipos (16 principales + Pollito Noob + Mini Faraón), 8 huevos, 4 fusiones especiales y reglas de habilidades. Las fusiones se resuelven de forma centralizada por padres y conservan las habilidades de ambos; no se programan 256 archivos por separado.

### Cadena
🥚 Huevos → 🐔 Pollos → 🧬 Fusiones → 🥚 Nuevos huevos → 🐔 Nuevos pollos

El sistema queda como base para conectarlo después al inventario, gallinero, tienda, combate y UI.
