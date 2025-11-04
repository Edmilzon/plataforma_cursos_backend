USE polimathia;

-- Asignación de puntos al aprobar exámenes
DELIMITER $$

CREATE TRIGGER trg_asignar_puntos_examen
AFTER UPDATE ON entrega_actividad
FOR EACH ROW
BEGIN
    -- Solo si se trata de una evaluación aprobada (>=60)
    IF NEW.id_evaluacion IS NOT NULL
       AND NEW.calificacion IS NOT NULL
       AND NEW.calificacion >= 60
       AND (OLD.calificacion IS NULL OR OLD.calificacion < 60) THEN

        -- Sumar puntos al usuario
        UPDATE usuario 
        SET saldo_punto = saldo_punto + 50
        WHERE id_usuario = NEW.id_usuario;

        -- Registrar en bitácora de puntos
        INSERT INTO punto_log (cantidad, motivo, fecha_otorgacion, id_usuario)
        VALUES (50, CONCAT('Aprobó evaluación ID ', NEW.id_evaluacion), NOW(), NEW.id_usuario);
    END IF;
END$$

DELIMITER ;

-- Puntos por entregar tareas
DELIMITER $$

CREATE TRIGGER trg_puntos_entrega_tarea
AFTER INSERT ON entrega_actividad
FOR EACH ROW
BEGIN
    -- Solo aplica para tareas (no evaluaciones)
    IF NEW.id_tarea IS NOT NULL THEN
        UPDATE usuario
        SET saldo_punto = saldo_punto + 10
        WHERE id_usuario = NEW.id_usuario;

        INSERT INTO punto_log (cantidad, motivo, fecha_otorgacion, id_usuario)
        VALUES (10, CONCAT('Entregó tarea ID ', NEW.id_tarea), NOW(), NEW.id_usuario);
    END IF;
END$$

DELIMITER ;


-- 3Validar y actualizar canje de recompensas
DELIMITER $$

CREATE TRIGGER trg_validar_y_actualizar_canje
BEFORE INSERT ON canje_recompensa
FOR EACH ROW
BEGIN
    DECLARE puntos_usuario INT DEFAULT 0;
    DECLARE stock INT DEFAULT 0;

    -- Consultar puntos del usuario y stock de la recompensa
    SELECT saldo_punto INTO puntos_usuario 
    FROM usuario 
    WHERE id_usuario = NEW.id_usuario;

    SELECT cantidad_disponible INTO stock 
    FROM recompensa 
    WHERE id_recompensa = NEW.id_recompensa;

    -- Validar puntos suficientes
    IF puntos_usuario < NEW.puntos_utilizados THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Puntos insuficientes para el canje.';
    END IF;

    -- Validar stock disponible
    IF stock <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay stock disponible para esta recompensa.';
    END IF; 

    -- Actualizar stock y restar puntos
    UPDATE recompensa 
    SET cantidad_disponible = cantidad_disponible - 1 
    WHERE id_recompensa = NEW.id_recompensa;

    UPDATE usuario 
    SET saldo_punto = saldo_punto - NEW.puntos_utilizados
    WHERE id_usuario = NEW.id_usuario;
END$$

DELIMITER ;

-- Asignar insignia automática al alcanzar 1000 puntos
DELIMITER $$

CREATE TRIGGER trg_asignar_insignia_puntos
AFTER UPDATE ON usuario
FOR EACH ROW
BEGIN
    -- Si el usuario supera los 1000 puntos
    IF NEW.saldo_punto >= 1000 
       AND (OLD.saldo_punto < 1000 OR OLD.saldo_punto IS NULL) THEN

        -- Verificar si existe la insignia 'Alumno Destacado'
        IF EXISTS (SELECT 1 FROM insignia WHERE nombre = 'Alumno Destacado') THEN
            INSERT INTO usuario_insignia (fecha_otorgacion, id_usuario, id_insignia)
            SELECT NOW(), NEW.id_usuario, id_insignia
            FROM insignia
            WHERE nombre = 'Alumno Destacado'
            LIMIT 1;

            -- Registrar en log de puntos
            INSERT INTO punto_log (cantidad, motivo, fecha_otorgacion, id_usuario)
            VALUES (0, 'Recibió la insignia "Alumno Destacado" al alcanzar 1000 puntos', NOW(), NEW.id_usuario);
        END IF;
    END IF;
END$$

DELIMITER ;

-- Registro automático de pagos en bitácora
DELIMITER $$

CREATE TRIGGER trg_log_pago
AFTER INSERT ON pago
FOR EACH ROW
BEGIN
    DECLARE v_id_usuario INT;
    DECLARE v_id_curso INT;

    -- Obtener el usuario y curso desde la inscripción asociada
    SELECT id_estudiante, id_curso 
    INTO v_id_usuario, v_id_curso
    FROM inscripcion 
    WHERE id_inscripcion = NEW.id_inscripcion;

    -- Registrar el evento en bitácora
    INSERT INTO bitacora (tipo_evento, id_usuario, descripcion, fecha_evento)
    VALUES ('Pago', v_id_usuario, 
            CONCAT('Pago realizado de Bs. ', NEW.monto, ' por el curso ID ', v_id_curso), 
            NOW());
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_actualizar_ranking
AFTER UPDATE ON usuario
FOR EACH ROW
BEGIN
    -- Solo actualizar si cambió el saldo de puntos
    IF NEW.saldo_punto <> OLD.saldo_punto THEN
        
        -- Si el usuario ya está en el ranking, actualiza su registro
        IF EXISTS (SELECT 1 FROM ranking WHERE id_usuario = NEW.id_usuario) THEN
            UPDATE ranking
            SET puntos = NEW.saldo_punto,
                fecha_actualizacion = NOW()
            WHERE id_usuario = NEW.id_usuario;
        ELSE
            -- Si no está en el ranking, insertarlo
            INSERT INTO ranking (id_usuario, puntos, fecha_actualizacion)
            VALUES (NEW.id_usuario, NEW.saldo_punto, NOW());
        END IF;
        
        -- Recalcular posiciones para todos los usuarios
        UPDATE ranking r
        JOIN (
            SELECT id_usuario, 
                   RANK() OVER (ORDER BY puntos DESC) AS nueva_posicion
            FROM ranking
        ) temp ON r.id_usuario = temp.id_usuario
        SET r.posicion = temp.nueva_posicion;
        
    END IF;
END$$

DELIMITER ;


-- Verificación final de triggers creados
SHOW TRIGGERS;
