# Portfolio React

Sitio web estatico personal para presentar proyectos en formato portfolio.

## Lo que ya incluye

- React + Vite
- Home con dos secciones:
  - Presentacion personal, redes y experiencia
  - Grilla de proyectos en cards
- Vista detalle por proyecto con:
  - Carrusel horizontal de imagenes
  - Seccion de texto descriptiva
  - Tecnologias y enlaces
- Selector de idioma ES/EN
- Estilo minimalista claro y responsive
- Workflow de deploy para GitHub Pages

## Scripts

- npm run dev
- npm run build
- npm run preview

## Estructura principal

- src/data/projects.js: datos de cards y detalle por proyecto
- src/data/profile.js: presentacion, experiencia y redes
- src/pages/HomePage.jsx: pantalla principal
- src/pages/ProjectDetailPage.jsx: pantalla de detalle
- src/components/ProjectCarousel.jsx: carrusel horizontal
- public/images/projects: imagenes de cada proyecto
- content/projects: carpeta para guardar .docx fuente
- .github/workflows/deploy.yml: pipeline de GitHub Pages

## Personalizacion rapida

1. Editar tu presentacion y redes en src/data/profile.js
2. Editar o agregar proyectos en src/data/projects.js
3. Reemplazar imagenes SVG/PNG en public/images/projects
4. Agregar .docx originales en content/projects

## GitHub Pages

Este repo ya trae workflow de Pages.

1. Push a la rama main
2. En GitHub, ir a Settings > Pages
3. En Build and deployment, seleccionar GitHub Actions
4. Esperar el workflow Deploy to GitHub Pages

## Nota sobre rutas

Se usa HashRouter para evitar problemas de 404 en rutas internas al refrescar en GitHub Pages.
