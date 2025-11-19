USE polimathia;

INSERT INTO rol (nombre, descripcion, icono_url) VALUES
('Estudiante', 'Acceso a cursos, evaluaciones y foros, con gestión básica de perfil.', '/icons/student.png'),
('Docente', 'Creación y gestión de contenido académico, evaluaciones y reportes.', '/icons/teacher.png'),
('Administrador', 'Gestión total de usuarios, roles y configuración del sistema.', '/icons/admin.png');

INSERT INTO permiso (nombre, descripcion) VALUES
('Acceder_Cursos', 'Permite acceder al catálogo y contenido de los cursos.'),
('Inscribirse_Cursos', 'Permite realizar inscripciones en programas académicos.'),
('Participar_Foros', 'Permite escribir y responder en los foros.'),
('Ver_Evaluaciones', 'Permite acceder y participar en evaluaciones.'),
('Gestionar_Perfil', 'Permite editar su información personal y progreso.'),
('Crear_Contenido', 'Permite crear y editar materiales académicos.'),
('Gestionar_Evaluaciones', 'Permite crear, calificar y modificar evaluaciones.'),
('Moderar_Foros', 'Permite moderar discusiones y eliminar comentarios.'),
('Ver_Reportes', 'Permite acceder a reportes de desempeño grupal.'),
('Gestionar_Usuarios', 'Permite crear, modificar o eliminar usuarios.'),
('Gestionar_Roles', 'Permite asignar o revocar roles y permisos.'),
('Configurar_Sistema', 'Permite modificar configuraciones generales del sistema.'),
('Ver_Reportes_Admin', 'Permite visualizar reportes administrativos globales.'),
('Autoridad_Seguridad', 'Control de auditorías y monitoreo de seguridad.');


INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT (SELECT id_rol FROM rol WHERE nombre='Estudiante'), id_permiso
FROM permiso WHERE nombre IN (
    'Acceder_Cursos',
    'Inscribirse_Cursos',
    'Participar_Foros',
    'Ver_Evaluaciones',
    'Gestionar_Perfil'
);

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT (SELECT id_rol FROM rol WHERE nombre='Docente'), id_permiso
FROM permiso WHERE nombre IN (
    'Acceder_Cursos',
    'Inscribirse_Cursos',
    'Participar_Foros',
    'Ver_Evaluaciones',
    'Gestionar_Perfil',
    'Crear_Contenido',
    'Gestionar_Evaluaciones',
    'Moderar_Foros',
    'Ver_Reportes'
);

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT (SELECT id_rol FROM rol WHERE nombre='Administrador'), id_permiso
FROM permiso WHERE nombre IN (
    'Acceder_Cursos',
    'Inscribirse_Cursos',
    'Participar_Foros',
    'Ver_Evaluaciones',
    'Gestionar_Perfil',
    'Crear_Contenido',
    'Gestionar_Evaluaciones',
    'Moderar_Foros',
    'Ver_Reportes',
    'Gestionar_Usuarios',
    'Gestionar_Roles',
    'Configurar_Sistema',
    'Ver_Reportes_Admin',
    'Autoridad_Seguridad'
);

INSERT INTO usuario (nombre, apellido, edad, correo, password, fecha_registro, avatar_url, saldo_punto)
VALUES ('Super', 'Admin', 30, 'admin@polimathia.com', 'admin_hash_seguro', NOW(), '/avatars/admin.png', 0);

INSERT INTO usuario_rol (id_usuario, id_rol)
VALUES (
    (SELECT id_usuario FROM usuario WHERE correo='admin@polimathia.com'),
    (SELECT id_rol FROM rol WHERE nombre='Administrador')
);

INSERT INTO insignia (nombre, descripcion, imagen_url, criterio) VALUES
('Iniciador', 'Por completar el registro y su perfil personal.', '/img/insignias/iniciador.png', 'COMPLETAR_REGISTRO'),
('Colaborador', 'Por realizar su primera aportación útil en un foro.', '/img/insignias/colaborador.png', 'PRIMER_APORTE_FORO'),
('Sobresaliente', 'Por aprobar un examen con una nota igual o superior al 90%.', '/img/insignias/sobresaliente.png', 'EXAMEN_>=90'),
('Aplicado', 'Por entregar una tarea antes de la fecha límite.', '/img/insignias/aplicado.png', 'ENTREGA_ANTICIPADA'),
('Canjeador', 'Por realizar su primer canje de puntos con éxito.', '/img/insignias/canjeador.png', 'PRIMER_CANJE');

INSERT INTO recompensa (nombre, descripcion, tipo, puntos_requeridos, cantidad_disponible, estado, imagen_url)
VALUES
('Descuento del 10% en un curso', 'Se aplica automáticamente al momento del pago.', 'Descuento', 300, 500, 'Activo', '/img/recompensas/desc_10.png'),
('Descuento del 25% en un curso', 'Se aplica automáticamente al momento del pago.', 'Descuento', 600, 300, 'Activo', '/img/recompensas/desc_25.png'),
('Acceso gratuito a un taller/seminario', 'El usuario puede seleccionar el seminario desde el catálogo.', 'Acceso', 800, 100, 'Activo', '/img/recompensas/seminario.png'),
('Certificación digital extra', 'Certificado adicional validado por la plataforma.', 'Certificado', 1000, 100, 'Activo', '/img/recompensas/certificado.png'),
('Curso completo gratuito', 'Cubre el costo de inscripción de un curso estándar.', 'Curso', 3000, 20, 'Activo', '/img/recompensas/curso_gratis.png');

INSERT INTO tipo_curso (nombre, descripcion, imagen_url) VALUES
('Programación', 'Cursos sobre desarrollo de software y lenguajes de programación.', '/img/tipos/programacion.png'),
('Diseño UX/UI', 'Diseño de interfaces y experiencia de usuario.', '/img/tipos/diseno.png'),
('Marketing Digital', 'Publicidad online, SEO y redes sociales.', '/img/tipos/marketing.png'),
('Ciencias de Datos', 'Estadística, análisis y machine learning.', '/img/tipos/datos.png');

INSERT INTO bitacora (tipo_evento, id_usuario, descripcion, fecha_evento)
VALUES ('Inicialización', (SELECT id_usuario FROM usuario WHERE correo='admin@polimathia.com'),
        'Configuración base de Polimathia completada.', NOW());

INSERT INTO ranking (id_usuario, posicion, puntos, fecha_actualizacion)
VALUES ((SELECT id_usuario FROM usuario WHERE correo='admin@polimathia.com'), 1, 0, NOW());
