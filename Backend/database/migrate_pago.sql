-- Agrega tipo de pago a las citas
ALTER TABLE citas
  ADD COLUMN tipo_pago ENUM('pagada','pendiente_pago','familiar','cortesia') NOT NULL DEFAULT 'pendiente_pago'
  AFTER estado;
