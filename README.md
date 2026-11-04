## Versión corregida (rama `correcciones-mejoras`)

Esta rama contiene las correcciones y mejoras solicitadas después de la evaluación.
La versión original de la prueba se conserva sin cambios en la rama `main` y en el tag `v1-prueba-original`.

### 1. Uso de Cloudinary
- Las fotografías capturadas se suben a Cloudinary con un *upload preset* sin firma (sin credenciales en el código).
- Se guardan en la carpeta `urbaninspect/incidencias` con la etiqueta `urbaninspect`.
- En MockAPI solo se almacena la URL pública (`secure_url`).
- Un pipe propio (`CloudinaryPipe`) solicita a Cloudinary la versión adecuada para cada pantalla:
  - Listado: `w_1200,h_500,c_fill,g_auto` (miniatura recortada en el área importante).
  - Detalle: `w_1600,c_limit` (no supera 1600 px).
  - En ambos casos `q_auto:good,f_auto`: calidad y formato automáticos (WebP/AVIF), con mucho menos peso que el original.

### 2. Mejoras de interfaz
| Pantalla | Mejoras |
|---|---|
| General | Paleta institucional (azul) y naranja de señalización, tarjetas redondeadas, íconos en lugar de emojis, nombre e ícono propios de la app. |
| Inicio | Saludo, total destacado, indicadores por estado con ícono y color, porcentaje de incidencias resueltas y accesos rápidos. |
| Listado | Filtro por estado aplicado en el servidor (conserva la paginación), estado sobre la foto, ícono por tipo, prioridad con color y esqueletos de carga. |
| Detalle | Foto de portada con estado y prioridad, barra de progreso del estado, datos agrupados en tarjetas y botón "Ver en el mapa". |
| Formulario | Secciones numeradas, barra de datos obligatorios completados, tipo y prioridad con botones, etiquetas Obligatoria/Opcional dinámicas, clima en recuadros y botón Guardar fijo. |
| Seguimiento | Filas con ícono por tipo, estado y prioridad, contador y mensaje vacío con acceso al listado. |

### 3. Control de versiones
- Rama de trabajo: `correcciones-mejoras`.
- La rama `main` no se modificó ni se fusionó con esta rama.
- APK de esta versión: `UrbanInspect-v2-correcciones.apk`.
