# Dashboard Administrativo Multiplataforma para E-commerce
Este proyecto consiste en el diseño y desarrollo de un panel de control (Dashboard) administrativo de alta fidelidad, diseñado para gestionar el catálogo, inventario y métricas de la plataforma principal de e-commerce (Next.js). El sistema destaca por una arquitectura híbrida y multiplataforma, conexión directa al BaaS (Supabase) y un roadmap orientado a la integración de inteligencia artificial y control de accesos.

## 1. Arquitectura del Frontend (Ionic, React & Vite)
El cliente administrativo está construido utilizando React dentro del ecosistema de Ionic Framework, empaquetado y optimizado por Vite.

- **Naturaleza Multiplataforma**: La utilización de Ionic permite mantener un único código base (Codebase) estructurado con componentes web adaptativos, preparado para ser compilado tanto como aplicación web (PWA) como aplicaciones móviles nativas (iOS/Android) utilizando Capacitor.
- **Renderizado del Cliente (CSR)**: A diferencia de la tienda en Next.js, este panel opera completamente del lado del cliente, garantizando transiciones de interfaz ultrarrápidas y gestión de estados complejos sin recargar la página.
- **Tipado Seguro e Infraestructura de Construcción**: Configurado estrictamente con TypeScript para prevenir errores en tiempo de desarrollo y Vite para un Hot Module Replacement (HMR) instantáneo.

## 2. Infraestructura de Datos y Conexión (Supabase Client)
La aplicación se conecta de forma directa y segura a la base de datos central sin requerir una API intermediaria pesada, delegando la carga y seguridad en Supabase.

- **Cliente Instanciado**: Utiliza el SDK `@supabase/supabase-js` configurado con variables de entorno protegidas (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) inyectadas dinámicamente en tiempo de compilación para evitar exposición en el código fuente.
- **Flujo de Datos Directo**: Realiza operaciones CRUD (Crear, Leer, Actualizar, Borrar) directamente sobre la base de datos PostgreSQL de Supabase, lo que permite una latencia mínima al gestionar el catálogo de productos o revisar el historial de pedidos.

## 3. Sincronización Automatizada de Datos (Event-Driven)
El Dashboard actúa como la principal interfaz de inserción de datos, pero se apoya fuertemente en el motor de base de datos para delegar procesos pesados.

- **Inserción Limpia**: Cuando un administrador crea o edita un producto desde el Dashboard, se realiza un simple `INSERT` o `UPDATE` en la tabla `productos`.
- **Delegación de Embeddings**: El Dashboard **no** procesa IA localmente. La creación de un nuevo producto aquí activa un Trigger en PostgreSQL que construye la metadata, seguido de un Webhook de Supabase que despierta los endpoints del servidor Next.js (`/api/generate-embeddings`) para generar los vectores semánticos con Gemini de forma asíncrona y transparente.

## 4. Evolución de la Arquitectura (Roadmap de IA & Seguridad)
El proyecto está en constante evolución y tiene planificada la integración de las siguientes características críticas:

### A. RBAC (Role-Based Access Control) y RLS
- **Gestión de Permisos**: Implementación de un sistema de roles para diferenciar el nivel de acceso (Ej: SuperAdmin, Editor de Catálogo, Analista de Ventas).
- **Hardening de Datos**: Integración estricta con las Políticas de Seguridad de Filas (Row Level Security - RLS) de Supabase. Al no tener actualmente una capa backend propia, el Dashboard dependerá al 100% de que la base de datos valide el token JWT del usuario logueado para permitir o denegar peticiones.

### B. Chunking de Datos Estructurados
- Fragmentación inteligente de descripciones largas de productos o manuales internos de la empresa subidos desde el Dashboard, optimizando la ingesta de texto antes de ser vectorizado por el sistema principal.

### C. Búsqueda Híbrida (Hybrid Search) Administrativa
- Integración nativa con `pgvector` para permitir a los administradores buscar productos o pedidos no solo por coincidencia exacta (SKU o Nombre), sino por similitud semántica (Ej: "Productos rojos de verano que tengan poco stock").

## 5. Configuración del Entorno de Desarrollo

1. **Variables de Entorno**: 
   Asegúrate de configurar tu archivo local (`.env`) en la raíz del proyecto para enlazar el cliente con la base de datos. Este archivo ya se encuentra excluido del rastreo en `.gitignore`.
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

2. **Ejecución Local**:
   ```bash
   npm install
   npm run dev
   ```
   El entorno local se levantará en el puerto 5173 (o el siguiente disponible).
