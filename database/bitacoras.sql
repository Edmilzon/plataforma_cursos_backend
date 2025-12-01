#Bitácoras de Seguridad

#Bitácoras Académicas

#Bitácoras de Transacciones (finanzas y puntos)

#Bitácoras Administrativas / Gestión de rol y permisos

#Bitacora del sistema (errores, eventos importantes)
CREATE TABLE bitacora_sistema (
    id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    tipo_evento VARCHAR(100),
    id_usuario INT NULL,
    tabla_afectada VARCHAR(100),
    descripcion TEXT,
    fecha_evento DATETIME,
    direccion_ip VARCHAR(50) NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

#BITÁCORA DE AUTENTICACIÓN
CREATE TABLE bitacora_autenticacion (
    id_aut INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    tipo_evento VARCHAR(50),   -- LOGIN, LOGOUT, INTENTO_FALLIDO
    fecha DATETIME,
    direccion_ip VARCHAR(50),
    detalle TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

#Bitacora de inscripciones
CREATE TABLE bitacora_inscripciones (
    id_bitacora_insc INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_curso INT,
    accion VARCHAR(50), -- INSCRIPCIÓN, CANCELACIÓN, FINALIZACIÓN
    fecha DATETIME,
    detalle TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

#Bitacora de transacciones financieras
CREATE TABLE bitacora_pagos (
    id_bitacora_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_inscripcion INT,
    monto DECIMAL(10,2),
    accion VARCHAR(50), -- PAGO_REALIZADO, REEMBOLSO, ERROR
    fecha DATETIME,
    detalle TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_inscripcion) REFERENCES inscripcion(id_inscripcion)
);


#Bitacora de puntos
CREATE TABLE bitacora_recompensas (
    id_bitacora_recompensa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_recompensa INT,
    accion VARCHAR(50), -- CANJE, AGOTADA, DEVUELTA
    puntos_utilizados INT,
    fecha DATETIME,
    detalle TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_recompensa) REFERENCES recompensa(id_recompensa)
);


#Bitacora de Cambios en Roles y Permisos
CREATE TABLE bitacora_roles (
    id_bitacora_roles INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_admin INT,
    id_usuario_afectado INT,
    id_rol INT,
    accion VARCHAR(50),  -- ASIGNAR, REMOVER
    fecha DATETIME,
    detalle TEXT,
    FOREIGN KEY (id_usuario_admin) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_afectado) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);
