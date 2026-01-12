-- Disparador para validar que la cantidad apostada sea positiva
CREATE OR REPLACE TRIGGER TRG_CHECK_CANTIDAD_APUESTA
BEFORE INSERT OR UPDATE ON transacciones_apuesta
FOR EACH ROW
BEGIN
    IF :NEW.cantidad_apostada <= 0 THEN
        RAISE_APPLICATION_ERROR(-20020, 'La cantidad apostada debe ser mayor a 0.');
    END IF;
END;
/

-- Disparador para validar saldo suficiente para APOSTAR
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_APUESTA
BEFORE INSERT ON transacciones_apuesta
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    SELECT cartera_monetaria INTO v_saldo FROM usuarios_jugador WHERE dni = (SELECT dni FROM usuarios_jugador WHERE id = :NEW.usuario_id);
    
    IF v_saldo < :NEW.cantidad_apostada THEN
        RAISE_APPLICATION_ERROR(-20021, 'Saldo insuficiente para realizar la apuesta.');
    END IF;
END;
/
