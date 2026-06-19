# Auditoría del portfolio/CV de Juan Kniazev

Fecha: 18 de junio de 2026

## Resumen ejecutivo

El portfolio tiene una base técnica sana y una estética coherente, pero hoy funciona más como una colección de información que como una propuesta profesional clara. Los CV recientes muestran un perfil bastante más potente: un profesional híbrido que conecta negocio, datos y software y que puede llevar iniciativas desde la necesidad hasta producción.

La mejora principal no es añadir más contenido, sino ordenar la evidencia y establecer una fuente única de verdad.

## Posicionamiento recomendado

Mensaje paraguas:

> Technical Project Manager / Software Engineer especializado en ERP retail, integraciones y automatización, con experiencia práctica en .NET, SQL, Python y entrega end-to-end.

La página puede permitir tres recorridos secundarios:

1. Project Management / ERP Delivery
2. .NET & Integrations
3. Data & Automation

Esto conserva la versatilidad sin transmitir dispersión.

## Información importante que falta o está débil

### Experiencia laboral verificable

La home resume la experiencia en tres frases agregadas. Debería mostrar una cronología real con:

- Empresa, rol y fechas.
- Contexto del producto o negocio.
- 2–4 responsabilidades o entregables.
- Tecnologías relevantes.
- Resultados cuantificados cuando puedan verificarse.

### Proyectos presentes en los CV pero ausentes del portfolio

- WalletBot.
- ImageHandler.
- Automatización de datos con Python/BigQuery/Jira/Drive.
- Caso de integraciones ERP REST/SOAP, aunque deba anonimizarse.
- Caso de delivery/AMOA, también anonimizado si es necesario.
- Hackathon Agro como caso breve con enlaces a publicaciones.

### Evidencia y métricas

Los proyectos describen bien la solución, pero casi no presentan resultados verificables. Conviene añadir:

- Estado y fecha de última actualización.
- Usuarios, ejecuciones, registros procesados o disponibilidad cuando existan.
- Qué parte fue realizada personalmente.
- Arquitectura resumida.
- Decisiones y trade-offs.
- Links a demo, repositorio o evidencia.

### Datos personales que requieren una fuente única

Existen inconsistencias entre documentos:

- Toulouse, Vélizy-Villacoublay y París como ubicación.
- VVT hasta agosto de 2026 frente a septiembre de 2026.
- Francés A1 o A2.
- Formación “en curso”, “finalizada”, “título en trámite” y “BSc”.
- Dos, tres o más años de experiencia según la versión.
- Algunos borradores contienen placeholders o afirmaciones que deben verificarse, como “80+ clientes”, fechas desde 2019 o credenciales sin completar.

## Reestructura de UI recomendada

### 1. Hero

- Nombre.
- Título profesional principal.
- Propuesta de valor de una frase.
- Ubicación, movilidad y permiso de trabajo.
- CTA primario: ver proyectos.
- CTA secundario: descargar CV.
- Enlaces a LinkedIn, GitHub y email.

Evitar presentar tres títulos equivalentes separados por barras sin explicar la conexión.

### 2. Navegación fija y breve

- Perfil
- Experiencia
- Proyectos
- Capacidades
- Formación
- Contacto

### 3. “Lo que aporto”

Tres pilares compactos:

- Delivery y coordinación.
- Ingeniería e integraciones.
- Datos y automatización.

### 4. Experiencia profesional

Timeline con Real2b y PedidosYa. Esta sección debe aparecer antes de información personal, cursos y certificaciones.

### 5. Proyectos/casos

Mostrar primero tres o cuatro casos fuertes. Cada card debería incluir:

- Problema.
- Aporte personal.
- Resultado.
- Stack.
- Estado.

Las páginas de detalle actuales son extensas y correctas como archivo, pero necesitan una síntesis superior para recruiters.

### 6. Capacidades

Agrupar por capacidad, no como nube de herramientas:

- Delivery/AMOA.
- Backend e integraciones.
- Data/automation.
- Frontend/product building.
- Operación y despliegue.

### 7. Formación, idiomas y certificaciones

Reducir el texto introductorio y mostrar únicamente credenciales relevantes. Separar cursos terminados de cursos en progreso.

### 8. Contacto final

Cerrar con una llamada clara a entrevista o conversación.

## Recomendaciones de repositorio y mantenimiento

### Fuente única de verdad

Crear `content/profile.json` o `content/profile.yml` para almacenar:

- Identidad y contacto.
- Posicionamiento.
- Ubicación.
- Permiso de trabajo y fecha exacta.
- Idiomas.
- Experiencias.
- Formación.
- Certificaciones.
- Proyectos.
- Última revisión.

La web y los CV descargables deberían derivarse de esa fuente.

### Variantes de CV

Mantener tres variantes controladas:

- `pm-erp`
- `dotnet-integrations`
- `data-automation`

Compartir experiencia, fechas, educación y contacto; variar solamente el título, resumen, skills priorizadas y proyectos seleccionados.

### Validaciones automáticas

Añadir al CI:

- `npm run lint`
- `npm run build`
- Prueba de enlaces y assets.
- Validación de schema para JSON.
- Detección de placeholders: `[EMAIL]`, `______`, `[Dates]`.
- Validación de fechas y consistencia entre idiomas.
- Auditoría de dependencias.

### Publicación

Usar pull requests o un formulario local/autenticado mediante backend. No pedir al usuario pegar un PAT de GitHub en una página pública. Aunque se guarde en `sessionStorage`, sigue exponiendo un token con permisos de escritura al contexto del navegador.

### Rutina de actualización

Una vez al mes o después de cada hito:

1. Actualizar la fuente de verdad.
2. Añadir métricas/evidencia.
3. Revisar CVs generados.
4. Ejecutar validaciones.
5. Publicar mediante PR.

## Hallazgos técnicos actuales

- `npm run lint` pasa.
- `npm run build` pasa.
- `react-router-dom` arrastra dos vulnerabilidades altas de producción corregibles.
- Rematap referencia `/images/projects/rematap-feed.jpg`, pero el asset no existe.
- La descripción SEO es genérica y no describe el perfil profesional.
- El atributo `lang` permanece en español al cambiar la interfaz a inglés.
- Falta soporte para francés, pese a ser un mercado objetivo importante.
- No se observa manejo explícito de `prefers-reduced-motion`.
- Los estados activos del selector de idioma no exponen `aria-pressed`.
- Las descargas de CV están definidas manualmente en el componente.
- Perfil, CVs y proyectos tienen fuentes separadas, lo que favorece inconsistencias.
- No hay tests ni validación de links/assets/contenido.

## Prioridad sugerida

### P0 — Credibilidad y seguridad

- Consolidar datos verdaderos y eliminar borradores con placeholders o cifras no verificadas.
- Retirar el login mediante PAT desde la página pública.
- Actualizar React Router.
- Corregir el asset roto de Rematap.

### P1 — Narrativa y estructura

- Reescribir hero y posicionamiento.
- Añadir timeline de experiencia.
- Incorporar WalletBot, ImageHandler y casos profesionales anonimizados.
- Reordenar la página según las necesidades de un recruiter.

### P2 — Sistema de mantenimiento

- Introducir fuente única de verdad.
- Generar las variantes de CV desde datos compartidos.
- Añadir schema y checks de CI.

### P3 — Refinamiento

- SEO y social preview.
- Francés.
- Accesibilidad y preferencias de movimiento.
- Analytics respetuoso de privacidad para medir qué CV y proyectos interesan más.

## Límite de la auditoría visual

El navegador integrado no pudo capturar la página publicada en esta ejecución. La evaluación de UI y accesibilidad se basó en el código fuente, estructura semántica y estilos; contraste real, foco visible, reflow, carga de fuentes y experiencia visual final deben verificarse con capturas y navegación real.
