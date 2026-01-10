-- Disparador para validar DNI en JUGADOR
CREATE OR REPLACE TRIGGER TRG_CHECK_DNI_JUGADOR
BEFORE INSERT OR UPDATE ON JUGADOR
FOR EACH ROW
BEGIN
    IF NOT REGEXP_LIKE(:NEW.dni, '^\d{8}[A-Z]$') THEN
        RAISE_APPLICATION_ERROR(-20001, 'El DNI del jugador debe tener 8 números y una letra mayúscula.');
    END IF;
END;
/

-- Disparador para validar Edad en JUGADOR (Mayor de 18)
CREATE OR REPLACE TRIGGER TRG_CHECK_EDAD_JUGADOR
BEFORE INSERT OR UPDATE ON JUGADOR
FOR EACH ROW
DECLARE
    v_edad NUMBER;
BEGIN
    v_edad := MONTHS_BETWEEN(SYSDATE, :NEW.fecha_nacimiento) / 12;
    IF v_edad < 18 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Debes ser mayor de 18 años para registrarte.');
    END IF;
END;
/

-- Disparador para validar DNI en ADMINISTRADOR
CREATE OR REPLACE TRIGGER TRG_CHECK_DNI_ADMIN
BEFORE INSERT OR UPDATE ON ADMINISTRADOR
FOR EACH ROW
BEGIN
    IF NOT REGEXP_LIKE(:NEW.dni, '^\d{8}[A-Z]$') THEN
        RAISE_APPLICATION_ERROR(-20003, 'El DNI del administrador debe tener 8 números y una letra mayúscula.');
    END IF;
END;
/
