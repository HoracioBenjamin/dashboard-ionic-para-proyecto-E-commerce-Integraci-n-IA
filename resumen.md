# 🛒 Resumen del Proyecto

**Dashboard Administrativo (Admin HQ) para el E-Commerce "Zapatillas Duoc / ShoesDuoc — WearShop"**

Proyecto académico (Duoc UC): panel de control administrativo **multiplataforma** para gestionar el catálogo, el inventario por talla, las marcas y las categorías de la tienda de e-commerce principal. Funciona como el **"Admin HQ"** (backend office) que alimenta de datos a la tienda en Next.js, y suma un copiloto de IA flotante.

> ⚠️ **Ojo:** este proyecto es **el Dashboard**, no la tienda. La tienda E-Commerce (Next.js + RAG) está en la ruta hermana `../Proyecto-E-commerce-Full-Stack-Integraci-n-de-IA/` y tiene su propio `resumen.md`.

---

## 📦 ¿Qué incluye?

| Sección | Detalle |
|---|---|
| **Páginas** | Splash (animada), Login / Registro, Home (grilla de accesos HQ), Subir Producto (crear/editar), Gestionar Productos (CRUD), Gestionar Stock (por talla), Gestionar Marcas, Gestionar Categorías |
| **Autenticación** | Supabase Auth (`signInWithPassword` / `signUp` / `signOut`), con guard de sesión en el Splash |
| **Productos** | Alta y edición con marca, categoría, color (picker HEX), precio normal/oferta, descripción, imagen y variantes de talla con stock |
| **Stock** | Vista por producto con desglose de unidades por talla, badge de total y modal de edición rápida (+/- por talla, crear nueva talla) |
| **Imágenes** | Componente dual (`ImagenCampo`): pegar **URL** o **subir archivo** a Supabase Storage por slug (con cámara/galería/archivos) |
| **IA** | Asistente flotante **ShoesDuoc AI** (chat) que consulta al backend de la tienda con el JWT de Supabase |
| **Roadmap** | RBAC + RLS, chunking de datos y búsqueda híbrida (pendientes, ver sección 4 del README) |

---

## 💻 Lenguajes y Tecnologías

- **Frontend:** **React 19** + **Ionic Framework 8** (`@ionic/react`) + **TypeScript 5.9**
- **Build:** **Vite 5** (HMR instantáneo) + `@vitejs/plugin-react` + `@vitejs/plugin-legacy`
- **Multiplataforma:** **Capacitor 8** (`@capacitor/app`, `haptics`, `keyboard`, `status-bar`) → un solo código base para **PWA / Android / iOS**
- **UI/UX:** componentes adaptativos de Ionic, **Framer Motion** (animación del Splash) y **react-colorful** (selector de color HEX)
- **Íconos/Assets:** **Ionicons 7** y placeholders SVG locales (data-URI, "anti-bucle" de imágenes caídas)
- **Renderizado:** 100% **CSR** (client-side), con `IonReactRouter` (React Router 5)

---

## 🗄️ Base de datos y almacenamiento

- **Supabase (PostgreSQL)** accedido **directo desde el cliente** con `@supabase/supabase-js` (sin API intermedia pesada).
- **Tablas usadas por el código:**
  - `productos` (nombre, precio, `precio_oferta`, `en_oferta`, descripción, `imagen_url`, `marca_id`, `categoria_id`, `color_id`)
  - `stock` (variantes por `producto_id` + `talla` + `cantidad`)
  - `marcas`, `categorias` (con `slug` generado automáticamente) y `colores`
- **Relaciones leídas:** `productos → marcas (nombre)`, `productos → categorias (nombre)`, `productos → stock` (alias de UI `detalle_tallas`).
- **Supabase Storage:** bucket **`imagenes`**, organizado por carpetas según el `carpeta`/`slug`:
  - `Producto_Imagenes/` · `Logo_Marcas/` · `Portada_Marcas/` · `Categoria_Imagenes/`
  - Subida con `upsert` (reemplaza), máx. **2 MB**, extensiones `jpg | jpeg | png | webp`.
- **Sincronización event-driven (del lado de la tienda):** un `INSERT`/`UPDATE` aquí dispara **Triggers de PostgreSQL** y **Database Webhooks** de Supabase que despiertan los endpoints de la tienda en Next.js (`/api/generate-embeddings`) para generar los vectores con Gemini. El Dashboard **no** procesa IA localmente.

---

## 🤖 Inteligencia Artificial

- **Componente:** asistente **ShoesDuoc AI** montado globalmente en `App.tsx` (`AiAssistant` → `AiChatWindow` + `AiChatButton` flotante con animación *pulse*).
- **Flujo:** mensaje del usuario → `sendDashboardChatMessage()` en `src/services/aiService.ts` → obtiene el **token de sesión** de Supabase Auth → `POST` a `${VITE_BACKEND_API_URL}/api/dashboard/chat` con header `Authorization: Bearer <JWT>`.
- **Propósito del token:** validación **RBAC** en el backend de la tienda (la IA y las consultas viven del lado del servidor Next.js, no en este cliente).
- **UI del chat:** burbujas usuario/asistente, cabecera, avatar, indicador de escritura y estilos propios (`components/IA/styles/chat.css`, `AiChat.css`).
- **Pendiente:** `src/services/geminiService.ts`, `src/services/ragService.ts` y `src/hooks/useChat.ts` existen **vacíos** (reservados para la IA local).

---

## 🔐 Acceso a datos y seguridad

- Login/registro vía **Supabase Auth**; el `JWT` resultante es el que se reenvía al backend para RBAC.
- Tema institucional **`#002855` (azul) + `#FFB800` (amarillo)** en `src/theme/variables.css`, con soporte de **dark mode del sistema**.
- La carpeta `.env` está excluida en `.gitignore` (las credenciales se inyectan en build-time).

---

## 🔑 Variables de entorno (`.env`)

| Variable | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `VITE_BACKEND_API_URL` | Base del backend Next.js (IA / RBAC). Default: `http://localhost:3000` |

---

## 📁 Estructura de carpetas

```
src/
├── App.tsx                  # Router (IonReactRouter) + montaje global del asistente IA
├── main.tsx                 # Bootstrap de Ionic/React
├── supabaseClient.ts        # Cliente único de Supabase (VITE_SUPABASE_*)
├── theme/variables.css      # Tema institucional ShoesDuoc/WearShop
├── components/
│   ├── ImagenCampo.tsx      # Campo dual: URL o subida a bucket (por slug)
│   ├── placeholder.ts       # Placeholder SVG local (data-URI)
│   ├── ExploreContainer.tsx
│   └── IA/                  # Copiloto: AiAssistant, AiChatButton, AiChatWindow
│       ├── components/      # ChatHeader, ChatBubble, ChatInput, AssistantAvatar
│       └── styles/chat.css  # Estilos del chat
├── pages/
│   ├── Splash.tsx           # Animación + guard de sesión (redirige a /home o /login)
│   ├── Login.tsx            # Login / Registro con Supabase Auth
│   ├── Home.tsx             # Grilla de accesos "WearShop HQ"
│   ├── SubirProducto.tsx    # Crear/editar producto + variantes de talla
│   ├── GestionarProductos.tsx
│   ├── GestionarStock.tsx   # Stock por talla + modal de edición rápida
│   ├── GestionMarcas.tsx
│   └── GestionarCategoria.tsx
└── services/
    ├── aiService.ts         # POST /api/dashboard/chat con JWT (RBAC)
    ├── geminiService.ts     # (vacío / reservado)
    └── ragService.ts        # (vacío / reservado)
public/                      # logos, splash.jpg, favicons, manifest.json (PWA)
cypress/                     # E2E (baseUrl http://localhost:5173)
capacitor.config.ts          # appId io.ionic.starter · appName "Dashboard"
```

---

## 🔗 Relación con el proyecto principal y el Acta de Constitución

- **Proyecto padre:** `Zapatillas Duoc: E-Commerce & Retail Analytics` (Acta de Constitución). Este Dashboard corresponde al **"Admin HQ"**, entregable del **Hito 6 — "Dashboard Admin HQ & Alertas Integradas (React)" (Semana 14)**.
- **Stakeholder asociado (Acta):** *Israel González — Frontend Dev (Dashboard) / QA Lead*.
- **Cobertura actual del dashboard:** autenticación, CRUD de productos / marcas / categorías, control de stock por talla, carga de imágenes y copiloto de IA.
- **Pendientes respecto a la visión del Acta:** los gráficos de analítica (**Chart.js / Recharts**), el **semáforo de alertas** de reabastecimiento y los módulos de *Ventas/Pedidos, Clientes, Mensajes y Ajustes* (hoy marcados como **"Pronto"** en el Home).
- **Sugerencia de documentación:** en el Acta, el Dashboard podría listarse de forma más explícita como entregable/requisito propio, ya que hoy aparece indirectamente (Hito 6 y el panel RF11 "Dashboard Administrativo HQ").

---

## 🧠 En una frase

> **Ionic + React + TypeScript (con Vite y Capacitor) que se conecta directo a Supabase para administrar productos, stock por talla, marcas y categorías del e-commerce, más un copiloto de IA que delega en el backend Next.js con validación RBAC por JWT.**
