# Cambios Implementados - Sistema de Autenticación de Clientes

## Resumen
Se implementó un sistema completo de autenticación independiente para usuarios finales (clientes) con las siguientes características:

- ✅ Registro e inicio de sesión con email y contraseña
- ✅ Activación inmediata sin verificación de email
- ✅ Compra como invitado (guest checkout) permitida
- ✅ Historial de pedidos para usuarios registrados
- ✅ Visualización de vigencia de licencias (30 días por defecto)
- ✅ Diseño simple y profesional

## Cambios en Base de Datos

### 1. Nuevo esquema (`drizzle/schema.ts`)
- **Nueva tabla `customers`**: Para almacenar clientes con autenticación independiente
  - `id`: ID único del cliente
  - `email`: Email único (usado para login)
  - `passwordHash`: Contraseña hasheada con bcrypt
  - `name`: Nombre opcional
  - `phone`: Teléfono opcional
  - `active`: Estado activo/inactivo
  - `createdAt`: Fecha de creación
  - `lastLogin`: Última fecha de login

- **Actualización tabla `orders`**:
  - `customerId`: Referencia al cliente (null para compras como invitado)
  - `expiresAt`: Fecha de expiración de la licencia (30 días desde la compra)

### 2. Migración SQL (`drizzle/0004_add_customers_and_license_expiry.sql`)
- Script SQL para crear la tabla `customers`
- Script SQL para agregar campos `customerId` y `expiresAt` a `orders`

## Cambios en Backend

### 1. Funciones de Base de Datos (`server/db.ts`)
Nuevas funciones agregadas:
- `createCustomer()`: Crear nuevo cliente
- `getCustomerByEmail()`: Buscar cliente por email
- `getCustomerById()`: Buscar cliente por ID
- `updateCustomerLastLogin()`: Actualizar último login
- `getCustomerOrders()`: Obtener pedidos de un cliente

### 2. Router de Clientes (`server/customerRouter.ts`)
Nuevo router con los siguientes endpoints:
- `customer.register`: Registro de nuevo cliente
- `customer.login`: Inicio de sesión
- `customer.me`: Obtener información del cliente actual
- `customer.logout`: Cerrar sesión
- `customer.myOrders`: Obtener pedidos del cliente con vigencia

**Características de seguridad:**
- Autenticación con JWT (JSON Web Tokens)
- Contraseñas hasheadas con bcrypt (10 rounds)
- Middleware `customerProcedure` para proteger rutas
- Validación de datos con Zod

### 3. Actualización de Routers (`server/routers.ts`)
- Integración del `customerRouter`
- Actualización de `orders.create` para soportar `customerId` y calcular `expiresAt`

## Cambios en Frontend

### 1. Nuevas Páginas

#### `client/src/pages/Login.tsx`
- Formulario de inicio de sesión
- Validación de email y contraseña
- Redirección a Mi Cuenta después del login
- Link a página de registro

#### `client/src/pages/Register.tsx`
- Formulario de registro con campos:
  - Email (requerido)
  - Contraseña (mínimo 6 caracteres, requerido)
  - Confirmar contraseña (requerido)
  - Nombre (opcional)
  - Teléfono (opcional)
- Validación de contraseñas coincidentes
- Redirección a Mi Cuenta después del registro

#### `client/src/pages/MyAccount.tsx`
- Información de la cuenta del cliente
- Historial completo de pedidos
- Visualización de vigencia de licencias:
  - Días restantes para licencias activas
  - Indicador de licencias expiradas
  - Fecha de expiración
- Estados de pedidos (pendiente, completado, cancelado)
- Botón de cerrar sesión

### 2. Componentes Actualizados

#### `client/src/components/Header.tsx`
- Detección automática de sesión de cliente
- Botón "Iniciar Sesión" para usuarios no autenticados
- Botón "Mi Cuenta" con icono de usuario para clientes autenticados
- Actualización en tiempo real del estado de autenticación

#### `client/src/pages/Home.tsx`
- Modificación de `handleWhatsAppCheckout` para incluir información del cliente si está logueado
- Soporte para compra como invitado (sin login)

### 3. Configuración de Rutas (`client/src/App.tsx`)
Nuevas rutas agregadas:
- `/login` - Página de inicio de sesión
- `/registro` - Página de registro
- `/mi-cuenta` - Panel de cuenta del cliente

### 4. Configuración de tRPC (`client/src/main.tsx`)
- Actualización para enviar `customerToken` en headers de Authorization
- Soporte para múltiples tipos de tokens (admin y customer)

## Flujo de Usuario

### Registro
1. Usuario accede a `/registro`
2. Completa el formulario con email y contraseña
3. Sistema crea cuenta y genera JWT token
4. Token se guarda en localStorage
5. Redirección automática a `/mi-cuenta`

### Login
1. Usuario accede a `/login`
2. Ingresa email y contraseña
3. Sistema valida credenciales
4. Genera JWT token con vigencia de 7 días
5. Token se guarda en localStorage
6. Redirección automática a `/mi-cuenta`

### Compra
1. **Usuario registrado**: 
   - Información del cliente se incluye automáticamente en el mensaje de WhatsApp
   - Pedido se asocia al `customerId`
   
2. **Usuario invitado**:
   - Puede comprar sin registrarse
   - Pedido se crea sin `customerId`

### Historial de Pedidos
1. Usuario autenticado accede a `/mi-cuenta`
2. Sistema muestra todos los pedidos del cliente
3. Para cada pedido completado se muestra:
   - Productos comprados
   - Total pagado
   - Días restantes de vigencia
   - Fecha de expiración

## Configuración de Vigencia

**Vigencia por defecto**: 30 días desde la fecha de creación del pedido

La vigencia se calcula automáticamente en:
- `server/routers.ts` - función `orders.create`
- `client/src/pages/MyAccount.tsx` - función `calculateDaysRemaining`

## Seguridad

1. **Contraseñas**: Hasheadas con bcrypt (10 rounds)
2. **Tokens JWT**: 
   - Firmados con HS256
   - Vigencia de 7 días
   - Almacenados en localStorage
3. **Validación**: Zod para validación de datos en backend
4. **Middleware**: Protección de rutas con `customerProcedure`

## Variables de Entorno Requeridas

```env
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=mysql://user:password@host:port/database
```

## Próximos Pasos para Despliegue

1. Configurar variable de entorno `JWT_SECRET` en producción
2. Ejecutar migración de base de datos
3. Desplegar backend y frontend
4. Probar flujo completo de registro, login y compra

## Notas Técnicas

- El sistema es completamente independiente del sistema de autenticación OAuth existente
- Los clientes y usuarios OAuth son entidades separadas
- Compatible con compras como invitado (sin afectar funcionalidad existente)
- Diseño responsive y accesible
