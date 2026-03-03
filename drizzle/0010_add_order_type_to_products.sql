-- Migration: Add orderType to products table
-- orderType: 'instant' = Cuentas Instantáneas (compra con saldo)
--            'on-demand' = Cuentas Bajo Pedido (solicitar por WhatsApp)

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `orderType` varchar(20) NOT NULL DEFAULT 'instant';
