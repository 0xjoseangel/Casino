-- Disparador de seguridad para sesiones
CREATE OR REPLACE TRIGGER TRG_PROTEGER_SESION_CERRADA
BEFORE UPDATE ON "SESION"
FOR EACH ROW
BEGIN
    -- Si la sesión ya estaba cerrada (0) y se intenta hacer un UPDATE
    IF :OLD."ACTIVA" = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'SEGURIDAD: No se pueden modificar datos de una sesión ya finalizada.');
    END IF;
END; -- django fix
/
