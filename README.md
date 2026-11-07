# MusicRights Web

Frontend de **MusicRights**, una aplicación que genera automáticamente el documento oficial de reclamación de derechos de autor de la SGAE y avisa a los músicos de los plazos antes de que caduquen.

> API: [MusicRights-api](https://github.com/AritzOntal/MusicRights-api) · Demo: [music-rights-web.vercel.app](https://music-rights-web.vercel.app)

---

## Funcionalidades

- Catálogo de obras con buscador, ordenación por columnas y métricas.
- Listado de conciertos con el **plazo de reclamación** calculado en el cliente y estados visuales (sin urgencia, próximo a caducar, urgente, caducado).
- Ficha del concierto con los datos del formulario de la SGAE, *setlist* y generación del PDF con un clic.
- Gestión de documentos generados (descarga y borrado).
- Panel de administración para cambiar el rol de los usuarios.

---

## Aspectos técnicos

- **React 19 + TypeScript + Vite**, con tipos compartidos entre servicios y componentes (`types/`).
- **Autenticación** con `useReducer` y Context API: el token JWT se guarda en `localStorage` y la sesión se restaura al recargar si no ha caducado (`jwt-decode`).
- **Rutas protegidas por rol** con React Router y un componente `ProtectedRoute` (`USER`, `MUSICIAN`, `ADMIN`).
- **Cliente HTTP centralizado** con Axios, que añade el token en la cabecera `Authorization`.
- **Hooks personalizados** (`useWorks`, `useConcerts`) que separan la obtención de datos de la presentación.
- **Sistema de diseño** con Tailwind CSS basado en *tokens* semánticos y componentes reutilizables.
- **Despliegue continuo en Vercel** desde el repositorio.

---

## Tests

Los tests del frontend se desarrollaron con **Vitest** y **React Testing Library** en la iteración anterior, [MusicRightsFull](https://github.com/AritzOntal/MusicRightsFull):

- **Unitarios**: el reducer de autenticación (acciones `INITIALIZE`, `LOGIN` y `LOGOUT`) y el hook `useWorks`, con el servicio simulado.
- **Integración**: el formulario de login muestra el error ante un 401, y el buscador del dashboard filtra correctamente la tabla.

---

## Ejecución en local

```bash
cp .env.example .env   # URL de la API
npm install
npm run dev
```

---

**Autor:** Aritz Ontalvilla
