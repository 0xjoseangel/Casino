-- Disparador para validar que la cantidad apostada sea positiva
CREATE OR REPLACE TRIGGER TRG_CHECK_CANTIDAD_APUESTA
BEFORE INSERT OR UPDATE ON "JUEGA"
FOR EACH ROW
BEGIN
    IF :NEW."CANTIDAD_APOSTADA" <= 0 THEN
        RAISE_APPLICATION_ERROR(-20020, 'La cantidad apostada debe ser mayor a 0.');
    END IF;
END; -- django fix
/

-- Disparador para validar saldo suficiente para APOSTAR
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_APUESTA
BEFORE INSERT ON "JUEGA"
FOR EACH ROW
DECLARE
    v_saldo NUMBER;
BEGIN
    SELECT "CARTERA_MONETARIA" INTO v_saldo FROM "JUGADOR" WHERE "DNI" = :NEW."USUARIO_ID";
    
    IF v_saldo < :NEW."CANTIDAD_APOSTADA" THEN
        RAISE_APPLICATION_ERROR(-20021, 'Saldo insuficiente para realizar la apuesta.');
    END IF;
END; -- django fix
/

-- Disparador para validar rango de apuesta (10€ - 1000€)
CREATE OR REPLACE TRIGGER TRG_CHECK_RANGO_APUESTA
BEFORE INSERT OR UPDATE ON "JUEGA"
FOR EACH ROW
BEGIN
    IF :NEW."CANTIDAD_APOSTADA" < 10 THEN
        RAISE_APPLICATION_ERROR(-20022, 'La apuesta mínima es de 10€.');
    ELSIF :NEW."CANTIDAD_APOSTADA" > 1000 THEN
        RAISE_APPLICATION_ERROR(-20023, 'La apuesta máxima es de 1.000€.');
    END IF;
END; -- django fix
/

-- Disparador para validar que SE TENGA SESIÓN (RF Nuevo)
CREATE OR REPLACE TRIGGER TRG_CHECK_SESION_REQUERIDA
BEFORE INSERT OR UPDATE ON "JUEGA"
FOR EACH ROW
BEGIN
    IF :NEW."SESION_ID" IS NULL THEN
        RAISE_APPLICATION_ERROR(-20024, 'Es obligatorio tener una sesión activa para apostar.');
    END IF;
END; -- django fix
/
