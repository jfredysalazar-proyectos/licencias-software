-- Migration: Create payment_methods table
-- Description: Tabla para gestionar métodos de pago configurables (WhatsApp, Hoodpay, etc.)

CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Identificador interno (whatsapp, hoodpay)',
  display_name VARCHAR(100) NOT NULL COMMENT 'Nombre para mostrar al cliente',
  description TEXT COMMENT 'Descripción del método de pago',
  enabled BOOLEAN DEFAULT FALSE COMMENT 'Si está habilitado para los clientes',
  config JSON COMMENT 'Configuración específica del método',
  sort_order INT DEFAULT 0 COMMENT 'Orden de visualización',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enabled (enabled),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar métodos de pago por defecto
INSERT INTO payment_methods (name, display_name, description, enabled, config, sort_order) VALUES
(
  'whatsapp',
  'Comprar por WhatsApp',
  'Contacta con nosotros por WhatsApp para completar tu compra',
  TRUE,
  JSON_OBJECT(
    'phone', '+573001234567',
    'message_template', 'Hola, estoy interesado en comprar las siguientes licencias:'
  ),
  1
),
(
  'hoodpay',
  'Pago con Criptomonedas',
  'Paga de forma segura con Bitcoin, Ethereum y otras criptomonedas',
  FALSE,
  JSON_OBJECT(
    'business_id', '',
    'api_key', '',
    'webhook_secret', '',
    'currency', 'USD',
    'test_mode', false
  ),
  2
);
