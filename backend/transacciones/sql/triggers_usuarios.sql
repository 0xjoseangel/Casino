-- Disparador para evitar saldo negativo en el Jugador
-- Esto es una protección crítica de integridad.
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_NO_NEGATIVO
BEFORE UPDATE OF "CARTERA_MONETARIA" ON "JUGADOR"
FOR EACH ROW
BEGIN
    IF :NEW."CARTERA_MONETARIA" < 0 THEN
        RAISE_APPLICATION_ERROR(-20030, 'Error crítico: El saldo del jugador no puede ser negativo.');
    END IF;
END; -- django fix
/
