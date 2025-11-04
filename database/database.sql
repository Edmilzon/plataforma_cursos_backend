    CREATE DATABASE polimathia;


    CREATE TABLE usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        apellido VARCHAR(100),
        edad INT,
        correo VARCHAR(150) UNIQUE,
        password VARCHAR(255),
        fecha_registro DATETIME,
        avatar_url VARCHAR(255),
        saldo_punto INT DEFAULT 0
    );

    CREATE TABLE rol (
        id_rol INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        descripcion TEXT,
        icono_url VARCHAR(255) NULL DEFAULT NULL
    );

    CREATE TABLE permiso (
        id_permiso INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        descripcion TEXT
    );

    CREATE TABLE usuario_rol (
        id_usuario_rol INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT,
        id_rol INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
    );

    CREATE TABLE rol_permiso (
        id_rol_permiso INT AUTO_INCREMENT PRIMARY KEY,
        id_rol INT,
        id_permiso INT,
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
        FOREIGN KEY (id_permiso) REFERENCES permiso(id_permiso)
    );

    CREATE TABLE tipo_curso (
        id_tipo_curso INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        descripcion TEXT,
        imagen_url VARCHAR(255) NULL DEFAULT NULL
    );

    CREATE TABLE curso (
        id_curso INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200),
        descripcion TEXT,
        fecha_inicio DATE,
        fecha_fin DATE,
        duracion INT,
        precio DECIMAL(10,2),
        modalidad VARCHAR(50),
        cupo INT,
        id_docente INT,
        id_tipo_curso INT,
        imagen_portada_url VARCHAR(255) NULL DEFAULT NULL,
        FOREIGN KEY (id_docente) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_tipo_curso) REFERENCES tipo_curso(id_tipo_curso)
    );

    CREATE TABLE modulo (
        id_modulo INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150),
        descripcion TEXT,
        orden INT,
        imagen_url VARCHAR(255) NULL DEFAULT NULL,
        id_curso INT,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
    );

    CREATE TABLE leccion (
        id_leccion INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150),
        contenido TEXT,
        url_recurso VARCHAR(255),
        orden INT,
        imagen_thumbnail_url VARCHAR(255) NULL DEFAULT NULL,
        id_modulo INT,
        FOREIGN KEY (id_modulo) REFERENCES modulo(id_modulo)
    );

    CREATE TABLE tarea (
        id_tarea INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150),
        descripcion TEXT,
        url_contenido VARCHAR(255),
        fecha_entrega DATE,
        id_leccion INT,
        FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion)
    );

    CREATE TABLE evaluacion (
        id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150),
        descripcion TEXT,
        tipo VARCHAR(50),
        fecha_hora_inicio DATETIME,
        fecha_hora_entrega DATETIME,
        calificacion_maxima DECIMAL(5,2),
        id_leccion INT,
        FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion)
    );

    CREATE TABLE horario (
        id_horario INT AUTO_INCREMENT PRIMARY KEY,
        dia_semana VARCHAR(20),
        hora_inicio TIME,
        hora_fin TIME,
        id_curso INT,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
    );

    CREATE TABLE foro (
        id_foro INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150),
        descripcion TEXT,
        fecha_creacion DATETIME,
        icono_url VARCHAR(255) NULL DEFAULT NULL,
        id_curso INT,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
    );

    CREATE TABLE inscripcion (
        id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
        fecha_inscripcion DATETIME,
        estado_progreso VARCHAR(50),
        porcentaje_completado DECIMAL(5,2),
        id_curso INT,
        id_estudiante INT,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
        FOREIGN KEY (id_estudiante) REFERENCES usuario(id_usuario)
    );

    CREATE TABLE pago (
        id_pago INT AUTO_INCREMENT PRIMARY KEY,
        monto DECIMAL(10,2),
        descuento_aplicado DECIMAL(5,2),
        puntos_utilizados INT,
        fecha_pago DATETIME,
        metodo_pago VARCHAR(50),
        estado VARCHAR(50),
        id_inscripcion INT,
        FOREIGN KEY (id_inscripcion) REFERENCES inscripcion(id_inscripcion)
    );

    CREATE TABLE punto_log (
        id_punto_log INT AUTO_INCREMENT PRIMARY KEY,
        cantidad INT,
        motivo TEXT,
        fecha_otorgacion DATETIME,
        id_usuario INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    );

    CREATE TABLE recompensa (
        id_recompensa INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150),
        descripcion TEXT,
        tipo VARCHAR(50),
        puntos_requeridos INT,
        cantidad_disponible INT,
        estado VARCHAR(50),
        imagen_url VARCHAR(255) NULL DEFAULT NULL
    );

    CREATE TABLE canje_recompensa (
        id_canje_recompensa INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT,
        id_recompensa INT,
        fecha_canje DATETIME,
        puntos_utilizados INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_recompensa) REFERENCES recompensa(id_recompensa)
    );

    CREATE TABLE insignia (
        id_insignia INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        descripcion TEXT,
        imagen_url VARCHAR(255),
        criterio TEXT
    );

    CREATE TABLE usuario_insignia (
        id_usuario_insignia INT AUTO_INCREMENT PRIMARY KEY,
        fecha_otorgacion DATETIME,
        id_usuario INT,
        id_insignia INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_insignia) REFERENCES insignia(id_insignia)
    );

    CREATE TABLE certificado (
        id_certificado INT AUTO_INCREMENT PRIMARY KEY,
        fecha_emision DATETIME,
        url_certificado VARCHAR(255),
        id_usuario INT,
        id_curso INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        thumbnail_url VARCHAR(255) NULL DEFAULT NULL,
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
    );

    CREATE TABLE notificacion (
        id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150),
        mensaje TEXT,
        tipo VARCHAR(50),
        fue_leida BOOLEAN,
        fecha_creacion DATETIME,
        id_usuario INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    );

    CREATE TABLE valoracion (
        id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
        calificacion DECIMAL(3,1),
        comentario TEXT,
        fecha_creacion DATETIME,
        id_usuario INT,
        id_curso INT,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
    );

    CREATE TABLE progreso_leccion (
        id_progreso_leccion INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_leccion INT NOT NULL,
        completado BOOLEAN DEFAULT FALSE,
        fecha_completado DATETIME,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion),
        UNIQUE (id_usuario, id_leccion) 
    );

    CREATE TABLE entrega_actividad (
        id_entrega INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_tarea INT,
        id_evaluacion INT,
        calificacion DECIMAL(5,2),
        url_archivo VARCHAR(255),
        fecha_entrega DATETIME,
        estado VARCHAR(50),
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
        FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
        FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion)
    );

    ## Registro automático en bitácora para pagos o inscripciones
    CREATE TABLE bitacora (
        id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
        tipo_evento VARCHAR(100),
        id_usuario INT,
        descripcion TEXT,
        fecha_evento DATETIME,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    );

    CREATE TABLE ranking (
        id_ranking INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        posicion INT,
        puntos INT,
        fecha_actualizacion DATETIME,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    );
