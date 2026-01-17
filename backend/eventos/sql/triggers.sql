-- =====================================================
-- TRIGGERS PL/SQL PARA EL MODULO DE EVENTOS
-- =====================================================

-- -----------------------------------------------------
-- TRIGGERS PARA PROMOCION
-- -----------------------------------------------------

-- Disparador para validar que fecha_fin >= fecha_inicio
CREATE OR REPLACE TRIGGER TRG_CHECK_FECHAS_PROMOCION
BEFORE INSERT OR UPDATE ON "EVENTOS_PROMOCION"
FOR EACH ROW
BEGIN
    IF :NEW."FECHA_FIN" < :NEW."FECHA_INICIO" THEN
        RAISE_APPLICATION_ERROR(-20040, 'La fecha de fin no puede ser anterior a la fecha de inicio.');
    END IF;
END;  -- django fix
/

-- Disparador para validar que max_jugadores no sea negativo
CREATE OR REPLACE TRIGGER TRG_CHECK_MAX_JUGADORES_PROMOCION
BEFORE INSERT OR UPDATE ON "EVENTOS_PROMOCION"
FOR EACH ROW
BEGIN
    IF :NEW."MAX_JUGADORES" < 0 THEN
        RAISE_APPLICATION_ERROR(-20041, 'El numero maximo de jugadores no puede ser negativo.');
    END IF;
END;  -- django fix
/

-- -----------------------------------------------------
-- TRIGGERS PARA TORNEO
-- -----------------------------------------------------

-- Disparador para validar que precio_inscripcion >= 0
CREATE OR REPLACE TRIGGER TRG_CHECK_PRECIO_TORNEO
BEFORE INSERT OR UPDATE ON "EVENTOS_TORNEO"
FOR EACH ROW
BEGIN
    IF :NEW."PRECIO_INSCRIPCION" < 0 THEN
        RAISE_APPLICATION_ERROR(-20042, 'El precio de inscripcion no puede ser negativo.');
    END IF;
END;  -- django fix
/

-- Disparador para validar que aforo_maximo > 0
CREATE OR REPLACE TRIGGER TRG_CHECK_AFORO_TORNEO
BEFORE INSERT OR UPDATE ON "EVENTOS_TORNEO"
FOR EACH ROW
BEGIN
    IF :NEW."AFORO_MAXIMO" <= 0 THEN
        RAISE_APPLICATION_ERROR(-20043, 'El aforo maximo debe ser mayor que 0.');
    END IF;
END;  -- django fix
/

-- Disparador para validar estados validos del torneo
CREATE OR REPLACE TRIGGER TRG_CHECK_ESTADO_TORNEO
BEFORE INSERT OR UPDATE ON "EVENTOS_TORNEO"
FOR EACH ROW
BEGIN
    IF :NEW."ESTADO" NOT IN ('programado', 'abierto', 'en curso', 'finalizado') THEN
        RAISE_APPLICATION_ERROR(-20044, 'Estado de torneo no valido. Debe ser: programado, abierto, en curso o finalizado.');
    END IF;
END;  -- django fix
/

-- Disparador para evitar modificar torneos finalizados
CREATE OR REPLACE TRIGGER TRG_PROTEGER_TORNEO_FINALIZADO
BEFORE UPDATE ON "EVENTOS_TORNEO"
FOR EACH ROW
BEGIN
    IF :OLD."ESTADO" = 'finalizado' AND :NEW."ESTADO" != 'finalizado' THEN
        RAISE_APPLICATION_ERROR(-20045, 'No se puede cambiar el estado de un torneo finalizado.');
    END IF;
END;  -- django fix
/

-- -----------------------------------------------------
-- TRIGGERS PARA PARTICIPA (Inscripcion a Promociones)
-- -----------------------------------------------------

-- Disparador para validar que la promocion este activa y VIGENTE al inscribirse
CREATE OR REPLACE TRIGGER TRG_CHECK_PROMOCION_ACTIVA
BEFORE INSERT ON "EVENTOS_PARTICIPA"
FOR EACH ROW
DECLARE
    v_estado NUMBER(1);
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
BEGIN
    SELECT "ESTADO", "FECHA_INICIO", "FECHA_FIN"
    INTO v_estado, v_fecha_inicio, v_fecha_fin
    FROM "EVENTOS_PROMOCION"
    WHERE "ID" = :NEW."PROMOCION_ID";

    IF v_estado = 0 THEN
        RAISE_APPLICATION_ERROR(-20046, 'No puedes inscribirte a una promocion inactiva.');
    END IF;
    
    IF SYSDATE < v_fecha_inicio OR SYSDATE > v_fecha_fin THEN
        RAISE_APPLICATION_ERROR(-20052, 'La promocion no esta vigente en la fecha actual.');
    END IF;
END;  -- django fix
/

-- Disparador para validar aforo maximo de promocion
CREATE OR REPLACE TRIGGER TRG_CHECK_AFORO_PROMOCION
BEFORE INSERT ON "EVENTOS_PARTICIPA"
FOR EACH ROW
DECLARE
    v_max_jugadores NUMBER;
    v_inscritos NUMBER;
BEGIN
    SELECT "MAX_JUGADORES" INTO v_max_jugadores
    FROM "EVENTOS_PROMOCION"
    WHERE "ID" = :NEW."PROMOCION_ID";

    -- Solo validar si max_jugadores > 0 (0 significa ilimitado)
    IF v_max_jugadores > 0 THEN
        SELECT COUNT(*) INTO v_inscritos
        FROM "EVENTOS_PARTICIPA"
        WHERE "PROMOCION_ID" = :NEW."PROMOCION_ID";

        IF v_inscritos >= v_max_jugadores THEN
            RAISE_APPLICATION_ERROR(-20047, 'La promocion ha alcanzado el numero maximo de participantes.');
        END IF;
    END IF;
END; -- django fix
/

-- Disparador para evitar inscripciones duplicadas en Promociones
CREATE OR REPLACE TRIGGER TRG_CHECK_DUPLICADO_PARTICIPA
BEFORE INSERT ON "EVENTOS_PARTICIPA"
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM "EVENTOS_PARTICIPA"
    WHERE "JUGADOR_ID" = :NEW."JUGADOR_ID" 
      AND "PROMOCION_ID" = :NEW."PROMOCION_ID";
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20051, 'Ya estas inscrito en esta promocion.');
    END IF;
END; -- django fix
/

-- -----------------------------------------------------
-- TRIGGERS PARA COMPITE (Inscripcion a Torneos)
-- -----------------------------------------------------

-- Disparador para validar que el torneo permina inscripciones
CREATE OR REPLACE TRIGGER TRG_CHECK_TORNEO_ABIERTO
BEFORE INSERT ON "EVENTOS_COMPITE"
FOR EACH ROW
DECLARE
    v_estado VARCHAR2(20);
BEGIN
    SELECT "ESTADO" INTO v_estado
    FROM "EVENTOS_TORNEO"
    WHERE "ID" = :NEW."TORNEO_ID";

    IF v_estado NOT IN ('programado', 'abierto') THEN
        RAISE_APPLICATION_ERROR(-20048, 'Este torneo no admite nuevas inscripciones.');
    END IF;
END; -- django fix
/

-- Disparador para validar aforo maximo del torneo
CREATE OR REPLACE TRIGGER TRG_CHECK_AFORO_COMPITE
BEFORE INSERT ON "EVENTOS_COMPITE"
FOR EACH ROW
DECLARE
    v_aforo_maximo NUMBER;
    v_inscritos NUMBER;
BEGIN
    SELECT "AFORO_MAXIMO" INTO v_aforo_maximo
    FROM "EVENTOS_TORNEO"
    WHERE "ID" = :NEW."TORNEO_ID";

    SELECT COUNT(*) INTO v_inscritos
    FROM "EVENTOS_COMPITE"
    WHERE "TORNEO_ID" = :NEW."TORNEO_ID";

    IF v_inscritos >= v_aforo_maximo THEN
        RAISE_APPLICATION_ERROR(-20049, 'El torneo ha alcanzado el aforo maximo.');
    END IF;
END;    -- django fix
/

-- Disparador para validar posicion en torneo
CREATE OR REPLACE TRIGGER TRG_CHECK_POSICION_TORNEO
BEFORE INSERT OR UPDATE ON "EVENTOS_COMPITE"
FOR EACH ROW
BEGIN
    IF :NEW."POSICION" IS NOT NULL AND :NEW."POSICION" <= 0 THEN
        RAISE_APPLICATION_ERROR(-20050, 'La posicion debe ser un numero positivo.');
    END IF;
END; -- django fix
/

-- Disparador para evitar inscripciones duplicadas en Torneos
CREATE OR REPLACE TRIGGER TRG_CHECK_DUPLICADO_COMPITE
BEFORE INSERT ON "EVENTOS_COMPITE"
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM "EVENTOS_COMPITE"
    WHERE "JUGADOR_ID" = :NEW."JUGADOR_ID" 
      AND "TORNEO_ID" = :NEW."TORNEO_ID";
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20053, 'Ya estas inscrito en este torneo.');
    END IF;
END; -- django fix
/
