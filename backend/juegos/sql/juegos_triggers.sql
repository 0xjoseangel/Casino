CREATE OR REPLACE TRIGGER TR_JUEGO_INTEGRIDAD
BEFORE INSERT OR UPDATE ON "JUEGO"
FOR EACH ROW
DECLARE
    v_tipo_valido BOOLEAN;
BEGIN
    IF :NEW."APUESTA_MINIMA" > :NEW."APUESTA_MAXIMA" THEN
        RAISE_APPLICATION_ERROR(-20001, 'Error: La apuesta minima (' || :NEW."APUESTA_MINIMA" || 
                                ') no puede ser mayor que la maxima (' || :NEW."APUESTA_MAXIMA" || ').');
    END IF;

    IF :NEW."APUESTA_MINIMA" <= 0 OR :NEW."APUESTA_MAXIMA" <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Error: Las apuestas deben ser valores positivos mayores que cero.');
    END IF;

    IF :NEW."TIPO" NOT IN ('tragaperras', 'ruleta', 'cartas') THEN
        RAISE_APPLICATION_ERROR(-20006, 'Error: El tipo de juego "' || :NEW."TIPO" || '" no es valido.');
    END IF;

    :NEW."NOMBRE" := UPPER(:NEW."NOMBRE");
END;