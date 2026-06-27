# 🧳 Petate — Inventario de ropa familiar

App para organizar toda la ropa de la familia entre dos casas (Nueva York y
España): armarios, maletas que se mueven de una casa a otra, viajes, fotos de
cada prenda y etiquetas (temporada, uso, estado, talla, valoración…).

Funciona como **sitio estático** (GitHub Pages) con los datos en la nube
(**Supabase**), así que se ve y se edita igual desde el móvil y el ordenador,
**sincronizado** y protegido con **contraseña**.

---

## 🚀 Puesta en marcha (una sola vez)

### 1. Crear el proyecto en Supabase
1. Entra en [supabase.com](https://supabase.com) y crea un proyecto nuevo
   (el plan gratis permite 2 proyectos activos; si ya tienes 2, borra uno o
   reutilízalo).
2. Cuando esté listo, ve a **SQL Editor → New query**, pega todo el contenido
   de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
   Esto crea las tablas, los datos iniciales, la seguridad y el almacén de fotos.

### 2. Crear tu usuario (la contraseña de acceso)
1. En Supabase: **Authentication → Users → Add user**.
2. Pon tu email y una contraseña. Marca el email como confirmado.
   (Repite para cada miembro de la familia que quieras que entre.)

### 3. Conectar la app con tu Supabase
1. En Supabase: **Settings → API**. Copia:
   - **Project URL**
   - La clave **anon / public**
2. Pégalas en [`frontend/src/lib/supabase.ts`](frontend/src/lib/supabase.ts)
   (sustituye los `PEGA_AQUI_…`). La clave anon es pública por diseño: no pasa
   nada porque esté en el código, porque el acceso real lo protege el login.

   > Alternativa más limpia: define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   > como *Secrets* del repo (Settings → Secrets and variables → Actions) y el
   > despliegue las usará automáticamente.

### 4. Publicar en GitHub Pages
1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz que estos cambios lleguen a la rama `main` (merge de la rama de trabajo).
   El workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) compila y
   publica solo. La web quedará en:
   `https://<tu-usuario>.github.io/petate/`

---

## 💻 Desarrollo local

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

(Usa la misma configuración de Supabase del paso 3.)

---

## 🧩 ¿Qué incluye?

- **Inicio** — Resumen y estadísticas (por persona, tipo, uso, temporada) y
  accesos rápidos (para donar, para tirar, queda grande/pequeña).
- **Ropa** — Inventario con foto, búsqueda y filtros por persona, categoría,
  temporada, uso, estado y talla.
- **Armarios** — Agrupados por casa.
- **Maletas** — Con botón para **mover la maleta** de una casa a otra.
- **Viajes** — Planificación con fechas y asignación de maletas.
- **Ajustes** — Familia (con colores) y ubicaciones, y cierre de sesión.

Etiquetas por prenda: tipo (abrigo, camiseta, zapato…), temporada
(invierno/verano…), uso (salir, casa, ensuciar/obra, pijama, donar, tirar…),
estado (nueva/vieja…), talla (me queda bien/grande/pequeña) y valoración (★).

---

## 🛠️ Tecnología

- **Frontend:** React + Vite + TypeScript + Tailwind (sitio estático)
- **Backend/datos:** Supabase (Postgres + Auth + Storage)
- **Hosting:** GitHub Pages

> La carpeta [`backend/`](backend/) contiene una versión alternativa con
> servidor propio (Express + SQLite) por si se quisiera auto-alojar. No es
> necesaria para el despliegue en GitHub Pages + Supabase.
