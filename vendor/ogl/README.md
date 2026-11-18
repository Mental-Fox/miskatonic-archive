# OGL 1.0.11

Минимальная WebGL-библиотека (https://github.com/oframe/ogl), лицензия Unlicense (общественное достояние).
`ogl.min.js` собран из npm-пакета `ogl@1.0.11` командой esbuild в один файл (IIFE, глобальная переменная `OGL`)
и содержит только нужные части: Renderer, Program, Mesh, Texture, Triangle.

Используется в `living-engraving.js`. Без этого файла гравюры остаются обычными картинками.
