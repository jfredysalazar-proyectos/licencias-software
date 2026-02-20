#!/bin/bash

# Script para ejecutar la migración SQL en Railway
# Este script se ejecutará en el contenedor de Railway

echo "=== Ejecutando Migración para sold_licenses ==="

# Leer el archivo SQL
SQL_FILE="drizzle/0008_create_sold_licenses_table.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Error: Archivo $SQL_FILE no encontrado"
  exit 1
fi

echo "Contenido del archivo SQL:"
cat "$SQL_FILE"
echo ""

# Usar npx ts-node para ejecutar el script de migración
echo "Ejecutando script de migración..."
npx ts-node run-migration-sold-licenses.ts

echo "Migración completada"
