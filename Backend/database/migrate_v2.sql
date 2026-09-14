USE consultorio;

-- 1. Tabla de adjuntos clínicos (exámenes de laboratorio, imágenes, ecografías, etc.)
CREATE TABLE IF NOT EXISTS adjuntos_historia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  historia_id INT NULL,
  paciente_id INT NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  archivo_path VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(50) DEFAULT 'documento',
  descripcion VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- 2. Campos de cobro y caja en la tabla de citas
ALTER TABLE citas
  ADD COLUMN costo DECIMAL(10, 2) DEFAULT 0.00 AFTER tipo_pago,
  ADD COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'otro') DEFAULT 'efectivo' AFTER costo,
  ADD COLUMN notas_pago VARCHAR(255) NULL AFTER metodo_pago,
  ADD COLUMN pagado_at TIMESTAMP NULL AFTER notas_pago;
