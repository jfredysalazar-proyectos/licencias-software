# Project TODO - SoftwareLicenses.Co

## Base de Datos y Backend
- [x] Crear tabla de productos con campos: nombre, descripción, categoría, precio, imagen, stock, características
- [x] Crear tabla de categorías de software
- [x] Crear tabla de pedidos para tracking
- [x] Implementar procedimientos tRPC para productos (listar, buscar, filtrar por categoría)
- [x] Implementar procedimiento tRPC para carrito de compras
- [x] Implementar procedimiento tRPC para checkout por WhatsApp

## Generación de Gráficos
- [x] Generar imagen de alta calidad para Windows
- [x] Generar imagen de alta calidad para Microsoft Office
- [x] Generar imagen de alta calidad para Office 365
- [x] Generar imagen de alta calidad para AutoCAD
- [x] Generar imagen de alta calidad para Adobe Creative Cloud
- [x] Generar imagen de alta calidad para CapCut
- [x] Generar imagen de alta calidad para Canva
- [x] Generar imagen de alta calidad para ChatGPT Plus
- [x] Generar imagen de alta calidad para Perplexity
- [x] Generar imágenes para hero section carousel

## Frontend - Diseño y Estilos
- [x] Configurar paleta de colores azul y gris profesional en index.css
- [x] Configurar tipografía profesional con Google Fonts
- [x] Crear componente de Header con logo, carrito y botón de inicio de sesión
- [x] Crear barra de notificación con TRM (Tasa de Cambio)

## Frontend - Hero Section
- [x] Implementar hero section con imagen de fondo de alta calidad
- [x] Crear carrusel de productos destacados con 6 slides
- [x] Implementar barra de búsqueda de productos

## Frontend - Productos
- [x] Crear componente de filtros por categorías (Sistemas Operativos, Productividad, Diseño, IA)
- [x] Implementar grid de tarjetas de productos
- [x] Crear componente ProductCard con imagen, nombre, descripción, precio, stock, botón
- [x] Implementar página de detalles de producto con información completa

## Frontend - Carrito de Compras
- [x] Crear componente de carrito de compras
- [x] Implementar funcionalidad de agregar productos al carrito
- [x] Implementar funcionalidad de eliminar productos del carrito
- [x] Mostrar total del carrito
- [x] Crear badge de contador de items en el header

## Frontend - Checkout
- [x] Implementar integración con WhatsApp para checkout
- [x] Crear mensaje formateado con detalles del pedido
- [x] Implementar botón de "Comprar por WhatsApp"

## Frontend - Testimonios
- [x] Crear sección de testimonios de clientes
- [x] Implementar carrusel de testimonios
- [x] Mostrar rating de satisfacción (4.9/5)

## Frontend - Footer
- [x] Crear footer con enlaces a políticas
- [x] Agregar enlaces a Centro de Ayuda y Contáctanos
- [x] Agregar enlace a Mis Pedidos
- [x] Agregar botón de WhatsApp flotante

## Testing
- [x] Crear tests para procedimientos de productos
- [x] Crear tests para categorías
- [x] Ejecutar y validar todos los tests
- [ ] Verificar funcionamiento en mobile y desktop

## Rebranding a LicenciasdeSoftware.org
- [x] Generar logo impactante para LicenciasdeSoftware.org
- [x] Actualizar Header con nuevo logo y nombre
- [x] Actualizar Footer con nuevo nombre
- [x] Actualizar título en index.html
- [x] Actualizar favicon
- [x] Actualizar referencias de marca en componentes

## Ajustes de Logo
- [x] Quitar texto "LicenciasdeSoftware.org" del Header
- [x] Quitar texto "LicenciasdeSoftware.org" del Footer
- [x] Ajustar tamaño del logo para mejor visualización (h-12)
- [x] Simplificar diseño mostrando solo el logo

## Ajuste de Tamaño de Logo
- [x] Aumentar tamaño del logo en Header para mejor visibilidad (h-16 / 64px)
- [x] Ajustar tamaño del logo en Footer proporcionalmente (h-14 / 56px)

## Optimización de Imágenes
- [x] Instalar dependencias para optimización de imágenes (sharp)
- [x] Comprimir y optimizar imágenes existentes (logo, favicon, productos, hero)
- [x] Convertir imágenes a formato WebP (productos y hero)
- [x] Implementar lazy loading en componentes de imágenes
- [x] Agregar dimensiones width/height a todas las imágenes
- [x] Actualizar URLs en base de datos a formato WebP
- [x] Script de optimización creado (optimize-images.mjs)

## Ajustes de Diseño
- [x] Eliminar barra azul de TRM del encabezado

## Mejoras de UX y Búsqueda
- [x] Implementar búsqueda en tiempo real con resultados mientras se escribe
- [x] Eliminar texto "Desde" del precio en ProductCard
- [x] Cambiar botón único por dos botones: "Ver Más" y "Comprar"
- [x] Estilizar botón "Comprar" con fondo negro y texto blanco

## Ajustes de ProductDetail
- [x] Eliminar palabra "Desde" del precio en página de detalle de producto

## Ajustes de Logo Header
- [x] Aumentar significativamente el tamaño del logo en el header (h-16 → h-20 / 80px)
- [x] Eliminar todos los bordes del logo
- [x] Mejorar visibilidad del logo

## Panel de Administración (Backoffice)
- [x] Crear tabla de configuración en base de datos para settings
- [x] Crear tabla de administradores con credenciales
- [x] Implementar sistema de autenticación independiente para admin
- [x] Crear página de login de administrador (/admin/login)
- [x] Crear layout de dashboard administrativo con sidebar
- [x] Implementar gestión de productos (CRUD completo)
- [x] Implementar gestión de categorías (vista de listado)
- [x] Implementar vista de clientes registrados
- [x] Implementar vista de pedidos/órdenes con cambio de estado
- [x] Crear página de configuración (WhatsApp, sitio, etc.)
- [x] Agregar procedimientos tRPC para operaciones admin
- [x] Proteger rutas administrativas con middleware
- [x] Agregar rutas de admin en App.tsx
- [x] Crear tests para funcionalidades admin (13/13 tests pasando)

## Upload de Imágenes en Gestión de Productos
- [x] Crear procedimiento tRPC para upload de imágenes a S3
- [x] Agregar optimización automática de imágenes a WebP (sharp)
- [x] Implementar campo de upload en formulario de productos
- [x] Agregar preview de imagen antes de guardar
- [x] Implementar reemplazo de imagen al editar producto
- [x] Agregar indicador de progreso de upload
- [x] Validar tipo y tamaño de archivo en frontend (5MB max) y backend
- [x] Crear tests para funcionalidad de upload (16/16 tests pasando)

## Corrección de Autenticación Admin
- [x] Revisar flujo de login y gestión de cookies
- [x] Corregir configuración de cookie (secure y sameSite dinámicos)
- [x] Cambiar procedimiento me a publicProcedure para evitar loop
- [x] Implementar verificación de sesión en AdminLayout con retry:false
- [x] Agregar invalidación de cache después del login
- [x] Mejorar manejo de errores en el proceso de autenticación

## CRUD Completo de Categorías
- [x] Agregar campo de icono/logo en schema de categorías
- [x] Implementar procedimientos tRPC para CRUD de categorías
- [x] Crear formulario de creación de categoría con upload de icono
- [x] Crear formulario de edición de categoría
- [x] Implementar eliminación de categoría con confirmación
- [x] Validar nombre único de categoría (slug)
- [x] Agregar preview de icono en listado de categorías
- [x] Mostrar iconos de categorías en el frontend (Home)
- [x] Generar iconos profesionales para 4 categorías
- [x] Actualizar base de datos con URLs de iconos
- [x] Crear tests para CRUD de categorías (21/21 tests pasando)

## Rediseño de Categorías
- [x] Cambiar formato de cuadrícula a botones horizontales
- [x] Aplicar fondo negro a los botones (activo) y gris oscuro (inactivo)
- [x] Mostrar logo pequeño (20px) a la izquierda sin fondo
- [x] Mantener efecto hover (bg-gray-700) y estado activo (bg-black)

## Carrusel de Categorías
- [x] Implementar carrusel horizontal con embla-carousel
- [x] Organizar botones en dos filas (split automático)
- [x] Agregar controles de navegación (flechas izquierda/derecha)
- [x] Mantener diseño de botones negro/gris con iconos
- [x] Crear componente CategoryCarousel reutilizable

## Corrección Login Admin (Crítico)
- [x] Cambiar estrategia de cookies a localStorage + Authorization header
- [x] Actualizar login para retornar token
- [x] Actualizar middleware adminProcedure para aceptar token desde header
- [x] Actualizar procedimiento me para aceptar token desde header
- [x] Configurar tRPC client para enviar token en headers
- [x] Actualizar Login.tsx para guardar token en localStorage
- [x] Actualizar logout para limpiar localStorage

## Páginas Legales y de Soporte
- [x] Crear página de Centro de Ayuda/Soporte con FAQ (8 preguntas)
- [x] Crear página de Términos y Condiciones
- [x] Crear página de Política de Privacidad
- [x] Crear página de Política de Devolución y Garantía
- [x] Agregar rutas en App.tsx para las nuevas páginas
- [x] Habilitar enlaces en el Footer
- [x] Actualizar enlaces del Footer a rutas correctas

## Sección "Por qué Elegirnos"
- [x] Crear componente WhyChooseUs con 4 tarjetas de beneficios
- [x] Agregar iconos de lucide-react para cada beneficio (Zap, Shield, Headphones, CheckCircle)
- [x] Integrar componente en página Home después del hero
- [x] Estilizar con diseño profesional azul/gris y estadísticas

## Cambio: Eliminar Carrusel de Categorías
- [x] Reemplazar CategoryCarousel con botones en una sola línea
- [x] Mantener funcionalidad de filtrado por categoría
- [x] Hacer botones responsivos con scroll horizontal en móvil (overflow-x-auto)

## Corrección: Botones de Categorías Cortados
- [x] Ajustar padding y margen del contenedor de botones (añadido -mx-4 px-4)
- [x] Asegurar que todos los botones sean visibles
- [x] Revisar overflow-x-auto y espaciado

## Cambio: Grid Responsivo para Categorías
- [x] Reemplazar flex con overflow por grid responsivo
- [x] Mostrar categorías en 2-4 columnas según ancho de pantalla (grid-cols-2 sm:grid-cols-3 lg:grid-cols-4)
- [x] Eliminar scroll horizontal
- [x] Mantener diseño de botones negro/gris con iconos
