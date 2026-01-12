-- Disparador para validar que la cantidad sea positiva
CREATE OR REPLACE TRIGGER TRG_CHECK_CANTIDAD_TRANSACCION
BEFORE INSERT OR UPDATE ON transacciones_transaccion
FOR EACH ROW
BEGIN
    IF :NEW.cantidad <= 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'La cantidad de la transacción debe ser mayor a 0.');
    END IF;
END;
/

-- Disparador para validar saldo suficiente en RETIRO
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_RETIRO
BEFORE INSERT ON transacciones_transaccion
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    IF :NEW.tipo = 'RETIRO' THEN
        SELECT cartera_monetaria INTO v_saldo FROM usuarios_jugador WHERE dni = (SELECT dni FROM usuarios_jugador WHERE id = :NEW.usuario_id);
        
        IF v_saldo < :NEW.cantidad THEN
            RAISE_APPLICATION_ERROR(-20011, 'Saldo insuficiente para realizar el retiro.');
        END IF;
    END IF;
END;
/

-- Disparador para validar saldo suficiente en TRANSFERENCIA
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_TRANSFERENCIA
BEFORE INSERT ON transacciones_transaccion
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    IF :NEW.tipo = 'TRANSFERENCIA' THEN
        SELECT cartera_monetaria INTO v_saldo FROM usuarios_jugador WHERE dni = (SELECT dni FROM usuarios_jugador WHERE id = :NEW.usuario_id);
        
        IF v_saldo < :NEW.cantidad THEN
            RAISE_APPLICATION_ERROR(-20012, 'Saldo insuficiente para realizar la transferencia.');
        END IF;
    END IF;
END;
/
