-- 1. Tabla de consultorios
CREATE TABLE IF NOT EXISTS consultorios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  nit         VARCHAR(30),
  direccion   VARCHAR(255),
  telefono    VARCHAR(30),
  ciudad      VARCHAR(100),
  email       VARCHAR(100),
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultorio de ejemplo
INSERT INTO consultorios (nombre, nit, ciudad) VALUES ('Consultorio Principal', '900000000-1', 'Bogotá');

-- 2. Vincular usuarios a consultorio (admin queda en NULL = super)
ALTER TABLE usuarios
  ADD COLUMN consultorio_id INT NULL AFTER especialidad_id,
  ADD FOREIGN KEY fk_usr_cons (consultorio_id) REFERENCES consultorios(id) ON DELETE SET NULL;

-- 3. Pacientes por consultorio
ALTER TABLE pacientes
  ADD COLUMN consultorio_id INT NOT NULL DEFAULT 1 AFTER antecedentes,
  ADD FOREIGN KEY fk_pac_cons (consultorio_id) REFERENCES consultorios(id);

-- 4. Citas por consultorio
ALTER TABLE citas
  ADD COLUMN consultorio_id INT NOT NULL DEFAULT 1 AFTER notas,
  ADD FOREIGN KEY fk_cit_cons (consultorio_id) REFERENCES consultorios(id);

-- 5. Historias clínicas por consultorio
ALTER TABLE historias_clinicas
  ADD COLUMN consultorio_id INT NOT NULL DEFAULT 1 AFTER datos_extra,
  ADD FOREIGN KEY fk_hc_cons (consultorio_id) REFERENCES consultorios(id);

-- 6. Incapacidades por consultorio
ALTER TABLE incapacidades
  ADD COLUMN consultorio_id INT NOT NULL DEFAULT 1 AFTER observaciones,
  ADD FOREIGN KEY fk_inc_cons (consultorio_id) REFERENCES consultorios(id);
