# Indiana Sánchez — Arquitecta de Miradas

Proyecto Vite + React preparado a partir del archivo JSX original.

## Requisitos
- Node.js 20.19+ o 22.12+
- npm

## Ejecutar localmente
```bash
npm install
npm run dev
```

## Generar versión de producción
```bash
npm run build
```
La carpeta lista para publicar se genera en `dist/`.

## Cloudflare Pages
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

## Antes de publicar
El archivo original incluye datos personales y credenciales de acceso codificados en el frontend. No publiques este proyecto tal como está. Mueve la autenticación y los datos privados a un backend seguro, y elimina/reemplaza datos reales o de demostración que no deban ser públicos. El frontend descargado por el navegador puede inspeccionarse.
