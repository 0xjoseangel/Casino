-- Disparador para validar que la cantidad sea positiva
CREATE OR REPLACE TRIGGER TRG_CHECK_CANTIDAD_TRANSACCION
BEFORE INSERT OR UPDATE ON "TRANSACCIONES_TRANSACCION"
FOR EACH ROW
BEGIN
    IF :NEW."CANTIDAD" <= 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'La cantidad de la transacción debe ser mayor a 0.');
    END IF;
END; -- django fix
/

-- Disparador para validar saldo suficiente en RETIRO
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_RETIRO
BEFORE INSERT ON "TRANSACCIONES_TRANSACCION"
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    IF :NEW."TIPO" = 'RETIRO' THEN
        SELECT "CARTERA_MONETARIA" INTO v_saldo FROM "JUGADOR" WHERE "DNI" = :NEW."USUARIO_ID";
        
        IF v_saldo < :NEW."CANTIDAD" THEN
            RAISE_APPLICATION_ERROR(-20011, 'Saldo insuficiente para realizar el retiro.');
        END IF;
    END IF;
END; -- django fix
/

-- Disparador para validar saldo suficiente en TRANSFERENCIA
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_TRANSFERENCIA
BEFORE INSERT ON "TRANSACCIONES_TRANSACCION"
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    IF :NEW."TIPO" = 'TRANSFERENCIA' THEN
        SELECT "CARTERA_MONETARIA" INTO v_saldo FROM "JUGADOR" WHERE "DNI" = :NEW."USUARIO_ID";
        
        IF v_saldo < :NEW."CANTIDAD" THEN
            RAISE_APPLICATION_ERROR(-20012, 'Saldo insuficiente para realizar la transferencia.');
        END IF;
    END IF;
END; -- django fix
/

-- Disparador para validar tope de depósito (10.000€)
CREATE OR REPLACE TRIGGER TRG_CHECK_DEPOSITO_MAX
BEFORE INSERT OR UPDATE ON "TRANSACCIONES_TRANSACCION"
FOR EACH ROW
BEGIN
    IF :NEW."TIPO" = 'DEPOSITO' AND :NEW."CANTIDAD" > 10000 THEN
        RAISE_APPLICATION_ERROR(-20013, 'El depósito máximo permitido es de 10.000€.');
    END IF;
END; -- django fix
/
