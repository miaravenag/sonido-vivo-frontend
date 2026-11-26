# Sonido Vivo — Tienda de Instrumentos Musicales (React)

Migración del sitio HTML + JavaScript "PaginaSonidoVivo" a **React + TypeScript + Vite + Bootstrap**,
con administración de usuarios, productos y categorías, tres roles y perfil personal (Evaluación Parcial N.° 2).
En la **Evaluación 3** se conecta a un backend **Spring Boot + MySQL** (repositorio `sonido-vivo-backend`) con
**JWT**, rutas protegidas e **historial de compras**. Ya no se usa `localStorage`.

## Cómo ejecutarlo

Primero hay que dejar el backend corriendo en `http://localhost:8080` (ver el README de `sonido-vivo-backend`).

```bash
npm install
npm run dev       # desarrollo -> http://localhost:5173
npm run build     # compila TypeScript y genera /dist
npm run lint      # revisa el código con ESLint
```

## Estructura

```
src/
├── main.tsx            Punto de entrada: Router + Providers (contextos)
├── App.tsx             Definición de rutas
├── api/                axiosConfig.ts: instancia de Axios (URL base, timeout y token JWT)
├── services/           Una llamada HTTP por operación (auth, usuarios, productos, categorías, compras)
├── components/         Piezas reutilizables de la interfaz
├── pages/              Una por cada página del sitio original
├── context/            Estado global (sesión, productos, categorías, carrito)
├── data/               Regiones y enlaces del menú por rol
├── types/              Interfaces TypeScript
├── utils/              formatearPrecio, validaciones, permisos por rol, manejo de errores HTTP
└── styles/styles.css   Estilos propios (los mismos de css/style.css)
```

## De dónde viene cada cosa (HTML/JS original → React)

| Sitio original | Ahora en React |
|---|---|
| `index.html` + `index.js` | `pages/Inicio.tsx` + `Hero`, `ProductosDestacados`, `QuienesSomos`, `Contacto` |
| `catalogo.html` + `catalogo.js` | `pages/Catalogo.tsx` + `FiltrosCatalogo`, `ProductoCard` |
| `detalle.html` + `detalle.js` | `pages/DetalleProducto.tsx` (ruta `/producto/:id`) |
| `carrito.html` + `carrito.js` | `pages/Carrito.tsx` + `CarritoFila` |
| `login.html` + `login.js` | `pages/Login.tsx` |
| `registro.html` + `registro.js` | `pages/Registro.tsx` + `utils/validaciones.ts` |
| Navbar y footer copiados en cada HTML | `components/Navbar.tsx`, `Footer.tsx`, `Layout.tsx` (una sola vez) |
| `storage.js` (productos, carrito, usuarios, sesión) | `context/ProductosContext`, `CarritoContext`, `AuthContext` (datos desde la API con Axios) |
| `main.js` (`mostrarError`, `mostrarExito`, `formatearPrecio`) | `components/Alerta.tsx`, `utils/formato.ts` |
| `document.createElement(...)` / `innerHTML` | JSX con `.map()` y render condicional |
| `getElementById(...).value` | Inputs controlados con `useState` |
| `detalle.html` + producto seleccionado | Parámetro de URL con `useParams` |
| `window.location.href = ...` / `setTimeout(...)` | `<Link>`, `useNavigate` (+ `setTimeout` para la espera) |
| `data-bs-toggle` (JS de Bootstrap) | Estado de React (`menuAbierto`, `usuarioAbierto`) |

## Conexión con el backend (Evaluación 3)

- **Axios**: `src/api/axiosConfig.ts` define la URL base (`http://localhost:8080`) y el timeout; cada archivo de
  `src/services/` hace las peticiones (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Sin `localStorage`**: productos, categorías, usuarios y compras vienen de MySQL a través de la API. El carrito
  vive solo en memoria de React.
- **JWT y sesión**: al iniciar sesión (`POST /auth/login`) el servidor entrega un token que `axiosConfig.ts` envía en
  cada petición (`Authorization: Bearer ...`). El token se guarda en `sessionStorage`, por eso la sesión sigue activa
  al recargar la página: `AuthContext` lo valida con `POST /auth/renovar` y recupera al usuario. Se renueva cada
  30 minutos y, si el servidor lo rechaza (401), se cierra la sesión.
- **Rutas protegidas**: `RutaProtegida` redirige al login si no hay sesión y muestra "Acceso denegado" si el rol no
  corresponde. El backend vuelve a validar el token y el rol en cada endpoint.
- **Estados de carga y errores**: las pantallas muestran un spinner mientras esperan al servidor y un mensaje claro si
  el backend está apagado o responde con error.
- **Historial de compras**: `/historial` (cada usuario ve sus compras) y `/gestion/compras` (el administrador ve las
  de todos los clientes). Al finalizar la compra se envía `POST /compras`.
- **Estado de las compras**: cada compra tiene un estado (`Pendiente`, `En preparación`, `Enviada`, `Entregada`,
  `Cancelada`) que se ve en el historial del cliente. El administrador lo cambia desde `/gestion/compras`
  (`PATCH /compras/{id}/estado`); al cancelar se devuelve el stock.
- **Reportes**: `/gestion/reportes` (solo administrador) muestra el dashboard con tarjetas, gráfico de barras y
  tabla de productos más vendidos, por semana, mes, año o todo el historial (`GET /reportes/resumen`).

## Roles

Cuentas de demostración (las crea el backend la primera vez que arranca con la base de datos vacía):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duocuc.cl` | `Admin123` |
| Vendedor | `vendedor@duocuc.cl` | `Vendedor123` |
| Cliente | `cliente@duocuc.cl` | `Cliente123` |

| Operación | Administrador | Vendedor | Cliente |
|---|:-:|:-:|:-:|
| Navegar y comprar | ✔ | ✔ | ✔ |
| Ver y editar su propio perfil (sin cambiar su rol) | ✔ | ✔ | ✔ |
| CRUD de usuarios y asignar cualquier rol | ✔ | — | — |
| Crear usuarios | ✔ (cualquier rol) | ✔ (solo clientes) | — |
| CRUD de productos | ✔ | — | — |
| Consultar productos y modificar stock | ✔ | ✔ | — |
| CRUD de categorías | ✔ | — | — |
| Ver su historial de compras | ✔ | ✔ | ✔ |
| Ver el historial de todas las compras | ✔ | — | — |
| Cambiar el estado de una compra | ✔ | — | — |
| Ver el dashboard de reportes | ✔ | — | — |

El registro público (`/registro`) siempre crea clientes. Las rutas `/perfil`, `/historial` y `/gestion/*` están
protegidas con `components/RutaProtegida.tsx`, y el backend (Spring Security) valida el token y el rol en cada endpoint.
