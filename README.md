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
- Panel admin privado para crear/editar proyectos y guardar en GitHub

## Scripts

- npm run dev
- npm run build
- npm run preview

## Estructura principal

- src/data/projects.js: datos de cards y detalle por proyecto
- src/pages/AdminProjectPage.jsx: formulario admin privado
- src/services/githubAdminApi.js: GitHub OAuth + escritura al repo
- src/data/profile.js: presentacion, experiencia y redes
- src/pages/HomePage.jsx: pantalla principal
- src/pages/ProjectDetailPage.jsx: pantalla de detalle
- src/components/ProjectCarousel.jsx: carrusel horizontal
- public/images/projects: imagenes de cada proyecto
- content/projects: fuente de verdad de proyectos (.json por proyecto)
- .github/workflows/deploy.yml: pipeline de GitHub Pages

## Personalizacion rapida

1. Editar tu presentacion y redes en src/data/profile.js
2. Ir a /#/admin para crear o actualizar proyectos
3. Cargar assets en public/images/projects y public/videos
4. Publicar desde el formulario para generar commit automatico

## Admin privado de proyectos

Ruta:
- /#/admin

La autenticacion valida que:
- el usuario de GitHub sea el definido en VITE_GITHUB_ALLOWED_USER
- la cuenta tenga permisos write sobre el repositorio

Configura .env.local basado en .env.example:

- VITE_GITHUB_OWNER
- VITE_GITHUB_REPO
- VITE_GITHUB_BRANCH
- VITE_GITHUB_ALLOWED_USER
- VITE_GITHUB_OAUTH_CLIENT_ID
- VITE_GITHUB_PROJECTS_PATH

Notas:
- En GitHub Pages, usa token personal (PAT) para iniciar sesion desde /#/admin.
- OAuth Device Flow desde frontend puede fallar por CORS en los endpoints de github.com/login/oauth/*.
- Si usas PAT Fine-grained, asigna permisos del repositorio: Contents (Read and write).
- El panel crea/actualiza content/projects/{slug}.json y eso dispara el deploy de Pages.
- El formulario solo se habilita despues del login con GitHub y validacion de permisos write.

Produccion (GitHub Pages):
- Define estas variables en GitHub (Settings > Secrets and variables > Actions):
  - VITE_GITHUB_OWNER
  - VITE_GITHUB_REPO
  - VITE_GITHUB_BRANCH
  - VITE_GITHUB_ALLOWED_USER
  - VITE_GITHUB_OAUTH_CLIENT_ID
  - VITE_GITHUB_PROJECTS_PATH
- El workflow de deploy inyecta esas variables al build para que /#/admin funcione online.

## GitHub Pages

Este repo ya trae workflow de Pages.

1. Push a la rama main
2. En GitHub, ir a Settings > Pages
3. En Build and deployment, seleccionar GitHub Actions
4. Esperar el workflow Deploy to GitHub Pages

Cuando publicas un proyecto desde /#/admin, se crea un commit en main y este workflow se ejecuta automaticamente.

## Nota sobre rutas

Se usa HashRouter para evitar problemas de 404 en rutas internas al refrescar en GitHub Pages.
