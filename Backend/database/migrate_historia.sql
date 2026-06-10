USE consultorio;

-- Agregar signos vitales a historias_clinicas
ALTER TABLE historias_clinicas
  ADD COLUMN IF NOT EXISTS tension_arterial VARCHAR(20),
  ADD COLUMN IF NOT EXISTS frecuencia_cardiaca VARCHAR(20),
  ADD COLUMN IF NOT EXISTS frecuencia_respiratoria VARCHAR(20),
  ADD COLUMN IF NOT EXISTS temperatura VARCHAR(10),
  ADD COLUMN IF NOT EXISTS peso VARCHAR(10),
  ADD COLUMN IF NOT EXISTS talla VARCHAR(10),
  ADD COLUMN IF NOT EXISTS saturacion_o2 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Tabla de incapacidades
CREATE TABLE IF NOT EXISTS incapacidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  historia_id INT,
  paciente_id INT NOT NULL,
  doctor_id INT NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias INT NOT NULL,
  diagnostico TEXT,
  tipo ENUM('reposo', 'incapacidad_laboral', 'reposo_relativo') DEFAULT 'reposo',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(id) ON DELETE SET NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (doctor_id) REFERENCES usuarios(id)
);
