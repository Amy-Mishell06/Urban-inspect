# UrbanInspect · Inspección de infraestructura urbana

<img src="resources/icono-urbaninspect.png" width="96" alt="Ícono de UrbanInspect" />

Aplicación móvil para que los inspectores del Municipio de Quito consulten, registren y actualicen incidencias de infraestructura urbana (luminarias, baches, señalización, alcantarillas y parques), con evidencia fotográfica, ubicación y consulta del clima.

**Tecnologías:** Ionic 8 · Angular 22 (standalone, zoneless con signals) · TypeScript · Capacitor

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

---

## Requisitos previos

- Node.js LTS (20 o superior) y npm
- Ionic CLI: `npm install -g @ionic/cli`
- Android Studio (SDK de Android y un emulador o un teléfono Android)
- Git

## Instalación y ejecución

```bash
git clone <URL-del-repositorio>
cd <carpeta-del-repositorio>
git checkout correcciones-mejoras
npm install
ionic serve
```

La URL del repositorio se copia desde el botón verde **Code** de GitHub. La app se abre en `http://localhost:8100`.

## Generar e instalar el APK

```bash
ionic build
npx cap sync android
npx cap open android
```

En Android Studio:
1. Esperar a que termine la sincronización de Gradle.
2. Ejecutar en el emulador o teléfono con **Run ▶**.
3. Generar el archivo con **Build → Build APK(s)**. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Datos de prueba

El servicio de oficina se simula con **MockAPI** (recurso `incidencias`). El script `seed.js` carga 30 incidencias de prueba (3 páginas de 10, los 3 estados, 5 tipos y 3 prioridades):

```bash
node seed.js
```

---

## Dependencias y su justificación

| Dependencia | Requisito | Motivo |
|---|---|---|
| `@capacitor/preferences` | R1, R8 | Guardar en el dispositivo la lista de seguimiento y el borrador del formulario. Persiste al cerrar la app y no se envía a la API. |
| `@capacitor/camera` | R6 | Capturar la fotografía y mostrar la vista previa antes de guardar. |
| `@capacitor/geolocation` | R7, R4 | Obtener las coordenadas actuales, que también se usan para consultar el clima. |
| `@ionic/pwa-elements` | R6 | Permite probar la cámara en el navegador durante el desarrollo. |
| `@capacitor/android` | R10 | Generar la aplicación instalable (APK). |

No se agregaron otras librerías. HTTP se maneja con `HttpClient` de Angular.

## Servicios externos

| Servicio | Uso | Motivo de la elección |
|---|---|---|
| **MockAPI** | Sistema de oficina (GET, POST, PUT) | Lo sugiere el enunciado. API REST real con paginación del lado del servidor (`page`, `limit`), sin backend propio. |
| **Open-Meteo** | Clima (R4) | Gratuito, sin API key y con temperatura actual, precipitación horaria en mm y código de condición meteorológica. |
| **Cloudinary** | Almacenamiento de fotos | La foto debe quedar accesible desde el detalle. Se sube la imagen y en la API se guarda la URL pública. Se usa un *upload preset* sin firma, así que el código no contiene contraseñas ni claves secretas. |

---

## Decisiones técnicas por requisito

- **R1 · Seguimiento local:** los códigos marcados se guardan con Preferences. La pestaña Seguimiento consulta solo esas incidencias. Desmarcar únicamente modifica el almacenamiento local.
- **R2 · Consulta:** se muestran código, tipo, descripción, dirección, sector, fecha, estado y foto (si existe), con mensajes para lista vacía y error de conexión (botón Reintentar).
- **R3 · Carga progresiva:** `ion-infinite-scroll` pide páginas de 10 con `?page=N&limit=10`. Si una página llega con menos de 10 registros, se desactiva el scroll y no se piden más páginas.
- **R4 · Clima:** se consulta Open-Meteo con las coordenadas de la incidencia (GPS o manuales). Muestra temperatura, precipitación de la última hora completa en mm y condición. Si supera 5 mm muestra una advertencia sin bloquear el registro. Para evitar resultados inconsistentes: se ignoran respuestas de consultas anteriores si cambian las coordenadas, se limpia el clima si las coordenadas son inválidas, hay un tiempo límite de 8 s y, si falta algún dato, se trata como "sin información". Si el servicio falla, se informa y se permite continuar.
- **R5 · Registro:** se validan los campos obligatorios antes del POST. Prioridad alta exige fotografía.
- **R6 · Fotografía:** vista previa antes de guardar. Si se cancela la captura, los demás datos no cambian. Si se niega el permiso de cámara y la foto es obligatoria, se explica la situación y la validación impide guardar.
- **R7 · Ubicación:** coordenadas por GPS o ingreso manual con validación de rangos (latitud −90 a 90, longitud −180 a 180). Obligatoria para baches y opcional para los demás tipos.
- **R8 · Borrador:** cada cambio del formulario se guarda localmente. Al abrir la app o el formulario se ofrece Continuar o Descartar. Si la foto es demasiado grande para el almacenamiento local, se recupera el resto de datos sin la foto.
- **R9 · Estados:** pendiente → en proceso o resuelta; en proceso → resuelta; resuelta no cambia. La observación es obligatoria para marcar como resuelta. El cambio se guarda con PUT.
- **R10 · Navegación:** pestañas Inicio (indicadores), Incidencias y Seguimiento, más páginas de Detalle y Nueva incidencia. Los listados e indicadores se recargan al crear o actualizar (`Subject` de cambios).
- **Angular 22 zoneless:** se usan *signals* para que la vista se actualice con respuestas asíncronas sin zone.js.

## Estructura principal

```
src/app/
├── models/incidencia.model.ts       Modelo, estados, tipos, íconos y colores
├── pipes/cloudinary.pipe.ts         Transformaciones de Cloudinary por pantalla
├── services/
│   ├── incidencias.service.ts       MockAPI (listar, obtener, crear, actualizar)
│   ├── seguimiento.service.ts       Seguimiento local (Preferences)
│   ├── borrador.service.ts          Borrador del formulario (Preferences)
│   ├── clima.service.ts             Open-Meteo
│   └── fotos.service.ts             Subida a Cloudinary
├── tab1/   Inicio con indicadores
├── tab2/   Listado con carga progresiva
├── tab3/   Seguimiento local
└── pages/
    ├── detalle/   Detalle y cambio de estado
    └── nueva/     Formulario de registro
resources/      Ícono de la aplicación
```
