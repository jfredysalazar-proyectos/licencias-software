# Guía Completa del Sistema - LicenciasdeSoftware.org

## Resumen General

Se han implementado exitosamente dos sistemas principales en la plataforma de e-commerce:

1. **Sistema de Autenticación de Clientes**
2. **Sistema de Variantes de Productos**

---

## 1. Sistema de Autenticación de Clientes

### Características Implementadas

#### ✅ Registro y Login
- Registro con email + contraseña
- Login con autenticación JWT
- Activación inmediata (sin verificación de email)
- Tokens con duración de 7 días
- Contraseñas hasheadas con bcrypt

#### ✅ Panel "Mi Cuenta"
- Visualización de datos del cliente
- Historial completo de pedidos
- Información de vigencia de licencias
- Contador de días restantes por licencia
- Estados de pedidos (pendiente, completado, cancelado)

#### ✅ Compra Flexible
- **Compra como invitado**: Sin necesidad de registrarse
- **Compra con cuenta**: Información automática en WhatsApp
- Integración transparente con el carrito existente

### Rutas Implementadas

- `/login` - Inicio de sesión
- `/registro` - Registro de nuevos clientes
- `/mi-cuenta` - Panel de usuario con historial

### API Endpoints (tRPC)

**`customer.register`**
- Input: `{ name, email, password }`
- Output: `{ token, customer }`

**`customer.login`**
- Input: `{ email, password }`
- Output: `{ token, customer }`

**`customer.me`**
- Requiere autenticación
- Output: Datos del cliente actual

**`customer.orders`**
- Requiere autenticación
- Output: Lista de pedidos con vigencia calculada

### Base de Datos

**Tabla `customers`**
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- createdAt (DATETIME)
```

**Tabla `orders` (modificada)**
```sql
- customerId (INT, NULLABLE) - Relación con customers
- expiresAt (DATETIME) - Fecha de expiración de licencia
```

### Vigencia de Licencias

- **Duración por defecto**: 30 días desde la compra
- **Cálculo automático**: Al crear orden completada
- **Visualización**: Días restantes en "Mi Cuenta"

---

## 2. Sistema de Variantes de Productos

### Características Implementadas

#### ✅ Backend Completo

**Base de Datos - 3 Tablas Nuevas:**

1. **`product_variants`**: Define tipos de variantes
   - Ejemplo: "Tiempo de Licencia", "Versión", "Tipo de Cuenta"
   
2. **`variant_options`**: Opciones para cada variante
   - Ejemplo: "1 mes", "3 meses", "OEM", "Retail"
   
3. **`product_skus`**: Combinaciones con precios (para futuro)
   - Permite precios diferentes por combinación

**API Endpoints (tRPC):**

**Admin (Gestión):**
- `admin.variants.list` - Listar variantes de un producto
- `admin.variants.create` - Crear variante con opciones
- `admin.variants.update` - Actualizar variante
- `admin.variants.delete` - Eliminar variante

**Público (Consulta):**
- `products.variants` - Obtener variantes de un producto

#### ✅ Panel de Administración

**Página `/admin/products/:productId/variants`**
- Interfaz intuitiva para gestionar variantes
- Agregar/eliminar variantes
- Agregar/eliminar opciones
- Guardado automático
- Validación de datos

**Integración en Lista de Productos:**
- Botón "Variantes" en cada producto
- Acceso directo desde la lista

#### ✅ Frontend para Clientes

**Componente `VariantSelector`:**
- Selector visual de opciones
- Diseño con radio buttons estilizados
- Auto-selección de primera opción
- Actualización en tiempo real

**Integración en Página de Producto:**
- Selector visible en `/producto/:slug`
- Selección antes de agregar al carrito
- Variantes incluidas en el toast de confirmación

**Visualización en Carrito:**
- Muestra variantes seleccionadas por item
- Formato: `Nombre Variante: Opción`
- Diferenciación de items con variantes distintas

**Checkout por WhatsApp:**
- Variantes incluidas en mensaje
- Formato claro y legible
- Ejemplo:
  ```
  1. Windows 11 Pro
     Tiempo de Licencia: 1 año
     Versión: Retail
     Tipo de Cuenta: Correo + Password
     Cantidad: 1
     Precio: $45,000 COP
  ```

### Estructura de Datos

**Ejemplo de Variante:**
```json
{
  "id": 1,
  "productId": 5,
  "name": "Tiempo de Licencia",
  "position": 0,
  "options": [
    { "id": 1, "value": "1 mes", "position": 0 },
    { "id": 2, "value": "3 meses", "position": 1 },
    { "id": 3, "value": "6 meses", "position": 2 },
    { "id": 4, "value": "1 año", "position": 3 }
  ]
}
```

**Ejemplo de Item en Carrito:**
```json
{
  "product": { /* datos del producto */ },
  "quantity": 1,
  "selectedVariants": [
    {
      "variantId": 1,
      "variantName": "Tiempo de Licencia",
      "optionId": 4,
      "optionValue": "1 año"
    },
    {
      "variantId": 2,
      "variantName": "Versión",
      "optionId": 5,
      "optionValue": "Retail"
    }
  ]
}
```

---

## 3. Cómo Usar el Sistema

### Para Administradores

#### Gestionar Variantes de Productos

1. **Acceder al Admin**:
   - URL: `/admin/login`
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Agregar Variantes a un Producto**:
   - Ve a "Productos"
   - Haz clic en "Variantes" del producto deseado
   - Agrega variantes (ej: "Tiempo de Licencia")
   - Agrega opciones para cada variante
   - Guarda los cambios

3. **Ejemplos de Variantes Comunes**:

   **Para Windows 11 Pro:**
   - Variante 1: Tiempo de Licencia
     - 1 mes, 3 meses, 6 meses, 1 año
   - Variante 2: Versión
     - OEM, Retail
   - Variante 3: Tipo de Cuenta
     - Correo + Password, Al correo del cliente

   **Para Office 365:**
   - Variante 1: Plan
     - Personal, Hogar, Empresa
   - Variante 2: Duración
     - 1 mes, 1 año
   - Variante 3: Entrega
     - Inmediata, 24 horas

### Para Clientes

#### Comprar con Variantes

1. **Navegar Productos**:
   - Explora el catálogo en la página principal
   - Haz clic en "Ver Más" en un producto

2. **Seleccionar Variantes**:
   - En la página del producto, verás las opciones disponibles
   - Selecciona tus preferencias (auto-selecciona la primera por defecto)
   - Haz clic en "Agregar al Carrito"

3. **Revisar Carrito**:
   - Abre el carrito
   - Verifica las variantes seleccionadas
   - Ajusta cantidades si es necesario

4. **Checkout**:
   - Haz clic en "Proceder con WhatsApp"
   - Se abrirá WhatsApp con el mensaje pre-formateado
   - Incluye todas las variantes seleccionadas

#### Registro y Login

1. **Registrarse**:
   - Haz clic en "Iniciar Sesión" en el header
   - Selecciona "Regístrate aquí"
   - Completa el formulario
   - Activación inmediata

2. **Ver Historial**:
   - Inicia sesión
   - Ve a "Mi Cuenta"
   - Revisa tus pedidos y vigencia de licencias

---

## 4. Archivos Modificados/Creados

### Backend

**Nuevos:**
- `server/customerRouter.ts` - Router de autenticación de clientes
- `client/src/components/VariantSelector.tsx` - Selector de variantes

**Modificados:**
- `drizzle/schema.ts` - Tablas de customers, variantes
- `server/db.ts` - Funciones de BD para customers y variantes
- `server/routers.ts` - Endpoint público de variantes
- `server/adminRouter.ts` - Endpoints admin de variantes

### Frontend

**Nuevos:**
- `client/src/pages/Login.tsx` - Página de login
- `client/src/pages/Register.tsx` - Página de registro
- `client/src/pages/MyAccount.tsx` - Panel de cuenta
- `client/src/pages/admin/ProductVariants.tsx` - Gestión de variantes
- `client/src/components/ProductVariantsManager.tsx` - Componente de gestión

**Modificados:**
- `client/src/contexts/CartContext.tsx` - Soporte de variantes
- `client/src/components/Header.tsx` - Botón de login/cuenta
- `client/src/components/CartDrawer.tsx` - Mostrar variantes
- `client/src/components/ProductCard.tsx` - Preparado para variantes
- `client/src/pages/Home.tsx` - WhatsApp con variantes
- `client/src/pages/ProductDetail.tsx` - Selector de variantes
- `client/src/App.tsx` - Nuevas rutas

---

## 5. Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express + tRPC + Node.js
- **Base de datos**: MySQL con Drizzle ORM
- **Autenticación**: JWT + bcrypt
- **Storage**: Filesystem local (imágenes)
- **UI Components**: Shadcn/ui

---

## 6. Próximas Mejoras Sugeridas

### Sistema de Variantes

1. **Precios por SKU**:
   - Interfaz para gestionar precios por combinación
   - Ejemplo: "1 año + Retail" = $50,000, "1 mes + OEM" = $15,000

2. **Stock por SKU**:
   - Control de inventario por combinación
   - Deshabilitar opciones agotadas

3. **Imágenes por Variante**:
   - Cambiar imagen según selección
   - Útil para variantes de color

### Sistema de Autenticación

1. **Recuperación de Contraseña**:
   - Email con token de recuperación
   - Formulario de reset

2. **Verificación de Email**:
   - Opcional para mayor seguridad
   - Email de bienvenida

3. **OAuth Social**:
   - Login con Google/Facebook
   - Integración con OAuth existente

### General

1. **Notificaciones por Email**:
   - Confirmación de pedido
   - Recordatorio de vencimiento de licencia

2. **Panel de Pedidos Admin**:
   - Gestión de estados
   - Asignación de licencias

3. **Sistema de Cupones**:
   - Descuentos por código
   - Promociones especiales

---

## 7. Notas de Seguridad

### Implementadas

✅ Contraseñas hasheadas con bcrypt
✅ Tokens JWT con expiración
✅ Validación de inputs con Zod
✅ Protección de rutas admin
✅ Cookies HTTP-only para sesiones

### Recomendaciones para Producción

⚠️ Cambiar contraseña de admin por defecto
⚠️ Configurar HTTPS en producción
⚠️ Implementar rate limiting
⚠️ Agregar CAPTCHA en registro
⚠️ Configurar CORS apropiadamente
⚠️ Backups automáticos de base de datos

---

## 8. Comandos Útiles

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Verificar TypeScript
pnpm check

# Construir proyecto
pnpm build

# Iniciar servidor
pnpm start
```

### Base de Datos

```bash
# Generar migración
pnpm drizzle-kit generate

# Aplicar cambios al esquema
pnpm drizzle-kit push

# Poblar datos de prueba
pnpm tsx seed-db.mjs
```

### Git

```bash
# Ver estado
git status

# Agregar cambios
git add -A

# Commit
git commit -m "mensaje"

# Push
git push origin main
```

---

## 9. Soporte y Contacto

Para dudas o problemas con el sistema:

- **Repositorio**: https://github.com/jfredysalazar-proyectos/licencias-software
- **Documentación adicional**: Ver archivos `CAMBIOS_AUTENTICACION.md` y `SISTEMA_VARIANTES.md`

---

## 10. Estado del Proyecto

### ✅ Completado

- Sistema de autenticación de clientes
- Historial de pedidos con vigencia
- Sistema de variantes (backend)
- Panel admin de variantes
- Selector de variantes en frontend
- Integración con carrito
- Checkout con variantes por WhatsApp
- Almacenamiento local de imágenes
- Documentación completa

### 🔄 Pendiente (Opcional)

- Precios dinámicos por SKU
- Stock por variante
- Recuperación de contraseña
- Notificaciones por email
- Panel de gestión de pedidos mejorado

---

**Fecha de última actualización**: Enero 20, 2026
**Versión del sistema**: 2.0.0
