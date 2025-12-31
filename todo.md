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
