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
-- Disparador para validar saldo suficiente para APOSTAR (Validando SESIÓN)
CREATE OR REPLACE TRIGGER TRG_CHECK_SALDO_APUESTA
BEFORE INSERT ON "JUEGA"
FOR EACH ROW
DECLARE
    v_saldo_inicio NUMBER;
    v_apostado NUMBER;
    v_ganado NUMBER;
    v_saldo_actual NUMBER;
BEGIN
    -- 1. Obtener datos de la sesión asociada
    -- Si SESION_ID es NULL, saltará el otro trigger, así que aquí asumimos que existe o lo ignoramos si es null.
    IF :NEW."SESION_ID" IS NOT NULL THEN
        SELECT "SALDO_INICIO" INTO v_saldo_inicio 
        FROM "SESION" 
        WHERE "ID" = :NEW."SESION_ID";

        -- 2. Calcular total apostado y ganado en esta sesión (excluyendo la actual que se está insertando)
        SELECT COALESCE(SUM("CANTIDAD_APOSTADA"), 0), COALESCE(SUM("GANANCIA"), 0)
        INTO v_apostado, v_ganado
        FROM "JUEGA"
        WHERE "SESION_ID" = :NEW."SESION_ID";

        -- 3. Calcular saldo actual disponible
        v_saldo_actual := v_saldo_inicio - v_apostado + v_ganado;

        -- 4. Validar
        IF v_saldo_actual < :NEW."CANTIDAD_APOSTADA" THEN
            RAISE_APPLICATION_ERROR(-20021, 'No tienes fichas suficientes. Tienes ' || v_saldo_actual || '€ y quieres apostar ' || :NEW."CANTIDAD_APOSTADA" || '€.');
        END IF;
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
