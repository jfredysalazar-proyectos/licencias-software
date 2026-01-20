# Sistema de Variantes de Productos

## Resumen

Se ha implementado un sistema completo de variantes de productos que permite ofrecer diferentes opciones del mismo producto con características personalizables.

## Características Implementadas

### ✅ Base de Datos

Se agregaron 3 nuevas tablas:

1. **`product_variants`**: Define los tipos de variantes para cada producto
   - Ejemplo: "Tiempo de Licencia", "Versión", "Tipo de Cuenta"
   - Campos: id, productId, name, position, createdAt

2. **`variant_options`**: Define las opciones disponibles para cada variante
   - Ejemplo: "1 mes", "3 meses", "6 meses" para "Tiempo de Licencia"
   - Campos: id, variantId, value, position, createdAt

3. **`product_skus`**: Define combinaciones específicas con precios
   - Cada SKU representa una combinación única de opciones
   - Campos: id, productId, sku, variantCombination (JSON), price, inStock, createdAt, updatedAt

### ✅ Backend (API tRPC)

**Endpoints de Variantes** (`admin.variants.*`):
- `list`: Obtener todas las variantes de un producto con sus opciones
- `create`: Crear una nueva variante con sus opciones
- `update`: Actualizar variante y sus opciones
- `delete`: Eliminar variante y sus opciones asociadas

**Endpoints de SKUs** (`admin.skus.*`):
- `list`: Obtener todos los SKUs de un producto
- `create`: Crear nuevo SKU con precio específico
- `update`: Actualizar SKU
- `delete`: Eliminar SKU

**Funciones de Base de Datos** (`server/db.ts`):
- Funciones completas para CRUD de variantes, opciones y SKUs
- Manejo automático de relaciones (al eliminar variante se eliminan sus opciones)

### ✅ Panel de Administración

**Componente `ProductVariantsManager`**:
- Interfaz intuitiva para gestionar variantes
- Agregar/eliminar variantes
- Agregar/eliminar opciones para cada variante
- Reordenar variantes y opciones (campo position)
- Validación de datos

**Página `/admin/products/:productId/variants`**:
- Página dedicada para gestionar variantes de cada producto
- Carga automática de variantes existentes
- Guardado completo de variantes
- Navegación fácil desde lista de productos

**Integración en Lista de Productos**:
- Botón "Variantes" en cada producto
- Acceso directo a gestión de variantes

## Cómo Usar el Sistema

### Para Administradores

1. **Crear Producto**:
   - Ve a `/admin/products`
   - Crea un producto normalmente con precio base

2. **Agregar Variantes**:
   - En la lista de productos, haz clic en "Variantes"
   - Agrega variantes (ej: "Tiempo de Licencia")
   - Agrega opciones para cada variante (ej: "1 mes", "3 meses", "6 meses")
   - Guarda los cambios

3. **Ejemplos de Variantes**:

   **Producto: Windows 11 Pro**
   - Variante 1: Tiempo de Licencia
     - 1 mes
     - 3 meses
     - 6 meses
     - 1 año
   
   - Variante 2: Versión
     - OEM
     - Retail
   
   - Variante 3: Tipo de Cuenta
     - Correo + Password
     - Al correo del cliente

### Estructura de Datos

**Ejemplo de variante en base de datos**:

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

**Ejemplo de SKU (combinación con precio)**:

```json
{
  "id": 1,
  "productId": 5,
  "sku": "WIN11PRO-1M-OEM-EMAIL",
  "variantCombination": "{\"1\": \"1\", \"2\": \"5\", \"3\": \"7\"}",
  "price": 45000,
  "inStock": 1
}
```

## Próximos Pasos (Pendientes)

### 🔄 Frontend para Clientes

1. **Selector de Variantes en Página de Producto**:
   - Mostrar variantes disponibles
   - Permitir selección de opciones
   - Actualizar precio según combinación seleccionada

2. **Integración con Carrito**:
   - Guardar variantes seleccionadas en items del carrito
   - Mostrar variantes en resumen del carrito
   - Incluir variantes en mensaje de WhatsApp

3. **Gestión de SKUs en Admin**:
   - Interfaz para crear combinaciones de variantes
   - Asignar precios específicos a cada combinación
   - Gestión de stock por SKU

## Ventajas del Sistema

✅ **Flexibilidad**: Variantes completamente personalizables
✅ **Escalabilidad**: Soporta múltiples variantes por producto
✅ **Precios Dinámicos**: Cada combinación puede tener su propio precio
✅ **Gestión Sencilla**: Interfaz intuitiva para administradores
✅ **Extensible**: Fácil de agregar nuevas funcionalidades

## Archivos Modificados/Creados

### Backend
- `drizzle/schema.ts` - Nuevas tablas de variantes
- `server/db.ts` - Funciones de base de datos
- `server/adminRouter.ts` - Endpoints tRPC

### Frontend - Admin
- `client/src/components/ProductVariantsManager.tsx` - Componente de gestión
- `client/src/pages/admin/ProductVariants.tsx` - Página de variantes
- `client/src/pages/admin/Products.tsx` - Integración de botón
- `client/src/App.tsx` - Nueva ruta

### Base de Datos
- Migraciones aplicadas automáticamente con `drizzle-kit push`

## Notas Técnicas

- Las variantes se guardan independientemente del producto
- Al eliminar una variante, se eliminan automáticamente sus opciones
- El campo `position` permite ordenar variantes y opciones
- El sistema soporta cualquier número de variantes por producto
- Las combinaciones de variantes se almacenan como JSON en SKUs

## Estado Actual

✅ Base de datos completa
✅ Backend API completo
✅ Panel de administración funcional
🔄 Frontend de cliente (pendiente)
🔄 Gestión de precios por SKU (pendiente)
🔄 Integración con carrito (pendiente)
