# Guía de Despliegue en Railway

## Requisitos Previos

- Cuenta en Railway.app
- Repositorio en GitHub
- Base de datos MySQL

## Pasos para Desplegar

### 1. Crear Proyecto en Railway

1. Ve a https://railway.app/dashboard
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona el repositorio `jfredysalazar-proyectos/licencias-software`

### 2. Agregar Base de Datos MySQL

1. En el proyecto, haz clic en "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se configurará automáticamente

### 3. Configurar Variables de Entorno

En la pestaña "Variables" del servicio, agrega:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu-clave-secreta-super-segura-cambiala
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-password-seguro
WHATSAPP_NUMBER=573001234567
SITE_NAME=LicenciasdeSoftware.org
SITE_EMAIL=info@licenciasdesoftware.org
```

### 4. Ejecutar Migraciones

Después del primer despliegue, ejecuta las migraciones:

1. Ve a la pestaña "Settings" del servicio
2. En "Deploy Triggers", agrega un comando post-deploy:
   ```
   pnpm drizzle-kit push
   ```

O conéctate por SSH y ejecuta:
```bash
railway run pnpm drizzle-kit push
```

### 5. Crear Usuario Administrador

Conéctate por SSH y ejecuta:
```bash
railway run pnpm tsx create-admin.mjs
```

### 6. Verificar Despliegue

1. Railway te dará una URL pública (ej: `https://tu-proyecto.up.railway.app`)
2. Visita la URL y verifica que el sitio funcione
3. Accede al admin en `/admin/login`

## Configuración de Dominio Personalizado

1. Ve a "Settings" → "Domains"
2. Haz clic en "Generate Domain" o "Custom Domain"
3. Configura tu dominio DNS según las instrucciones

## Troubleshooting

### Error de Conexión a Base de Datos

- Verifica que `DATABASE_URL` esté configurada
- Asegúrate de que las migraciones se hayan ejecutado

### Error 502 Bad Gateway

- Revisa los logs en Railway
- Verifica que el puerto sea 3000 o el que Railway asigne

### Imágenes no se muestran

- El directorio `uploads/` debe persistir
- Considera usar un servicio de almacenamiento externo (S3, Cloudinary)

## Mantenimiento

### Actualizar el Proyecto

1. Haz push a GitHub
2. Railway desplegará automáticamente

### Backup de Base de Datos

1. Ve a la base de datos en Railway
2. Usa "Connect" para obtener credenciales
3. Exporta con `mysqldump`

### Ver Logs

```bash
railway logs
```

## Costos

Railway ofrece:
- $5 USD de crédito gratis al mes
- Después: ~$5-10 USD/mes dependiendo del uso

## Soporte

- Documentación: https://docs.railway.app
- Discord: https://discord.gg/railway
