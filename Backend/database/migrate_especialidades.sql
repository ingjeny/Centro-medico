-- 1. Tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  activo      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Campos personalizados por especialidad
CREATE TABLE IF NOT EXISTS campos_especialidad (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  especialidad_id  INT NOT NULL,
  nombre           VARCHAR(100) NOT NULL,   -- clave interna (snake_case)
  etiqueta         VARCHAR(150) NOT NULL,   -- label visible
  tipo             ENUM('texto','textarea','numero','select','checkbox','fecha') NOT NULL DEFAULT 'texto',
  opciones         TEXT,                    -- JSON array para tipo 'select'
  unidad           VARCHAR(30),             -- ej: "mmHg", "kg", "sem"
  requerido        TINYINT(1) NOT NULL DEFAULT 0,
  seccion          VARCHAR(100) NOT NULL DEFAULT 'Datos específicos',
  orden            INT         NOT NULL DEFAULT 0,
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- 3. Vincular doctores a especialidad (reemplaza la columna texto)
--    Si ya existe la columna de texto, la renombramos primero
ALTER TABLE usuarios
  ADD COLUMN especialidad_id INT NULL AFTER especialidad,
  ADD FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE SET NULL;

-- 4. Guardar datos extra en historias
ALTER TABLE historias_clinicas
  ADD COLUMN datos_extra JSON NULL AFTER observaciones;

-- Especialidades por defecto
INSERT INTO especialidades (nombre, descripcion, color) VALUES
  ('Medicina General',  'Consulta general, signos vitales y tratamiento básico', '#6366f1'),
  ('Ginecología',       'Control prenatal, última menstruación, ecografía, etc.',  '#ec4899'),
  ('Odontología',       'Piezas dentales, procedimientos orales, odontograma',     '#0ea5e9'),
  ('Radiología',        'Lectura e interpretación de imágenes diagnósticas',        '#f59e0b');

-- Campos ejemplo: Ginecología
SET @gin = (SELECT id FROM especialidades WHERE nombre='Ginecología');
INSERT INTO campos_especialidad (especialidad_id, nombre, etiqueta, tipo, unidad, seccion, orden) VALUES
  (@gin, 'fum',             'Fecha última menstruación (FUM)', 'fecha',   NULL,  'Ginecología', 1),
  (@gin, 'semanas_gest',    'Semanas de gestación',            'numero',  'sem', 'Ginecología', 2),
  (@gin, 'fur',             'Fecha última revisión',           'fecha',   NULL,  'Ginecología', 3),
  (@gin, 'num_embarazos',   'Número de embarazos',             'numero',  NULL,  'Ginecología', 4),
  (@gin, 'num_partos',      'Número de partos',                'numero',  NULL,  'Ginecología', 5),
  (@gin, 'anticoncepcion',  'Método anticonceptivo',           'select',  NULL,  'Ginecología', 6),
  (@gin, 'ecografia',       'Hallazgos ecografía',             'textarea',NULL,  'Ginecología', 7),
  (@gin, 'papanicolaou',    'Resultado Papanicolaou',          'texto',   NULL,  'Ginecología', 8);

-- Opciones anticoncepción
UPDATE campos_especialidad SET opciones='["Ninguno","Hormonal oral","Inyectable","DIU","Implante","Condón","Ligadura","Otro"]'
  WHERE nombre='anticoncepcion' AND especialidad_id=@gin;

-- Campos ejemplo: Odontología
SET @odo = (SELECT id FROM especialidades WHERE nombre='Odontología');
INSERT INTO campos_especialidad (especialidad_id, nombre, etiqueta, tipo, unidad, seccion, orden) VALUES
  (@odo, 'piezas_afectadas', 'Piezas dentales afectadas',    'texto',    NULL,   'Odontología', 1),
  (@odo, 'procedimiento',    'Procedimiento realizado',      'select',   NULL,   'Odontología', 2),
  (@odo, 'anestesia',        'Anestesia aplicada',           'texto',    NULL,   'Odontología', 3),
  (@odo, 'odontograma_obs',  'Observaciones odontograma',   'textarea', NULL,   'Odontología', 4),
  (@odo, 'rx_dental',        'Hallazgos Rx dental',          'textarea', NULL,   'Radiología',  5),
  (@odo, 'proximo_control',  'Próximo control',              'fecha',    NULL,   'Odontología', 6);

UPDATE campos_especialidad SET opciones='["Extracción","Obturación","Endodoncia","Limpieza","Profilaxis","Ortodoncia","Corona","Implante","Otro"]'
  WHERE nombre='procedimiento' AND especialidad_id=@odo;

-- Campos ejemplo: Radiología
SET @rx = (SELECT id FROM especialidades WHERE nombre='Radiología');
INSERT INTO campos_especialidad (especialidad_id, nombre, etiqueta, tipo, unidad, seccion, orden) VALUES
  (@rx, 'tipo_estudio',   'Tipo de estudio',        'select',   NULL, 'Radiología', 1),
  (@rx, 'region',         'Región anatómica',        'texto',    NULL, 'Radiología', 2),
  (@rx, 'tecnica',        'Técnica / proyección',    'texto',    NULL, 'Radiología', 3),
  (@rx, 'hallazgos',      'Hallazgos / Descripción', 'textarea', NULL, 'Radiología', 4),
  (@rx, 'conclusion',     'Conclusión / Impresión',  'textarea', NULL, 'Radiología', 5),
  (@rx, 'recomendacion',  'Recomendaciones',         'textarea', NULL, 'Radiología', 6);

UPDATE campos_especialidad SET opciones='["Rx simple","Rx contrastada","Ecografía","TAC","RMN","Mamografía","Densitometría","Otro"]'
  WHERE nombre='tipo_estudio' AND especialidad_id=@rx;
