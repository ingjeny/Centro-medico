CREATE DATABASE IF NOT EXISTS consultorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE consultorio;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'doctor', 'secretaria') NOT NULL DEFAULT 'secretaria',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  sexo ENUM('M', 'F', 'Otro'),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion VARCHAR(255),
  tipo_sangre VARCHAR(5),
  alergias TEXT,
  antecedentes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  doctor_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(255),
  estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (doctor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historias_clinicas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cita_id INT,
  paciente_id INT NOT NULL,
  doctor_id INT NOT NULL,
  fecha DATE NOT NULL,
  motivo_consulta TEXT,
  sintomas TEXT,
  examen_fisico TEXT,
  diagnostico TEXT,
  tratamiento TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cita_id) REFERENCES citas(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (doctor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  historia_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  duracion VARCHAR(100),
  indicaciones TEXT,
  FOREIGN KEY (historia_id) REFERENCES historias_clinicas(id) ON DELETE CASCADE
);

-- Admin por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@consultorio.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;
