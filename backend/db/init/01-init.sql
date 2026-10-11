CREATE Table roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roleid INTEGER,
    FOREIGN KEY (roleid)
        REFERENCES roles(id)
        ON DELETE SET NULL
);


CREATE TABLE ranks(
    id SERIAL PRIMARY KEY,
    rank_name TEXT NOT NULL,
    display_order INTEGER NOT NULL UNIQUE,
    short_name text NOT NULL,
    plural_name text NOT NULL
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    nickname TEXT NOT NULL,
    rank_id INTEGER,
    join_date DATE,
    country TEXT,
    birth_date DATE,

    FOREIGN KEY (rank_id)
        REFERENCES ranks(id)
        ON DELETE SET NULL
);

-- tabla para definir tipos de misiones(entrenamientos, misiones etc)
CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO event_types (name)
VALUES
    ('mission'),
    ('training');



CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type_id INTEGER,

    FOREIGN KEY (type_id)
        REFERENCES event_types(id)
        ON DELETE SET NULL
);

CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'justified'
);

CREATE TABLE event_attendance (
    event_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status attendance_status NOT NULL,
    justification TEXT,

    PRIMARY KEY (event_id, member_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE
);

CREATE TABLE events_member_stats(
    member_id INTEGER PRIMARY KEY,
    consecutive_absences INTEGER DEFAULT 0,
    events_attended INTEGER DEFAULT 0, -- NOTA:  ESTA COL NO SE PARA QUE FUE CREADA, CREO QUE ACTUALMENTE NO TIENE USO, REVISAR Y ELIMINAR EN EL CASO DE 
    total_present INTEGER DEFAULT 0,
    total_absences INTEGER DEFAULT 0,
    total_justified INTEGER DEFAULT 0,

    FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE

);

CREATE TABLE events_member_type_stats (
    member_id INTEGER NOT NULL,
    event_type_id INTEGER NOT NULL,

    total_present INTEGER NOT NULL DEFAULT 0,
    total_absences INTEGER NOT NULL DEFAULT 0,
    total_justified INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (member_id, event_type_id),

    FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE,

    FOREIGN KEY (event_type_id)
        REFERENCES event_types(id)
        ON DELETE CASCADE
);





--trigers de  event member stats  general
CREATE OR REPLACE FUNCTION stats_after_insert()
RETURNS TRIGGER AS $$
BEGIN

  UPDATE events_member_stats
  SET
    total_present = total_present + (NEW.status = 'present')::int,
    total_absences = total_absences + (NEW.status = 'absent')::int,
    total_justified = total_justified + (NEW.status = 'justified')::int,

    consecutive_absences =
      CASE
        WHEN NEW.status = 'absent'
          THEN consecutive_absences + 1
        WHEN NEW.status = 'present'
          THEN 0
        ELSE consecutive_absences
      END

  WHERE member_id = NEW.member_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_stats_insert
AFTER INSERT ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION stats_after_insert();

CREATE OR REPLACE FUNCTION stats_after_update()
RETURNS TRIGGER AS $$
BEGIN

  UPDATE events_member_stats
  SET
    total_present = (
      SELECT COUNT(*) FROM event_attendance
      WHERE member_id = NEW.member_id AND status = 'present'
    ),
    total_absences = (
      SELECT COUNT(*) FROM event_attendance
      WHERE member_id = NEW.member_id AND status = 'absent'
    ),
    total_justified = (
      SELECT COUNT(*) FROM event_attendance
      WHERE member_id = NEW.member_id AND status = 'justified'
    )
  WHERE member_id = NEW.member_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_update
AFTER UPDATE ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION stats_after_update();

CREATE OR REPLACE FUNCTION create_member_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO events_member_stats (member_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_member_stats
AFTER INSERT ON members
FOR EACH ROW
EXECUTE FUNCTION create_member_stats();


--DELETE
CREATE OR REPLACE FUNCTION stats_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events_member_stats
    SET
        total_present = total_present - (OLD.status = 'present')::int,
        total_absences = total_absences - (OLD.status = 'absent')::int,
        total_justified = total_justified - (OLD.status = 'justified')::int
    WHERE member_id = OLD.member_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_delete
AFTER DELETE ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION stats_after_delete();



--  FIN

---trigers y funciones de estadisticas de miembro por typo de evento


CREATE OR REPLACE FUNCTION refresh_member_type_stats(
    p_member_id INTEGER
)
RETURNS VOID AS $$
BEGIN

    DELETE FROM events_member_type_stats
    WHERE member_id = p_member_id;

    INSERT INTO events_member_type_stats (
        member_id,
        event_type_id,
        total_present,
        total_absences,
        total_justified
    )
    SELECT
        ea.member_id,
        e.type_id,

        COUNT(*) FILTER (
            WHERE ea.status = 'present'
        ),

        COUNT(*) FILTER (
            WHERE ea.status = 'absent'
        ),

        COUNT(*) FILTER (
            WHERE ea.status = 'justified'
        )

    FROM event_attendance ea
    JOIN events e ON e.id = ea.event_id

    WHERE ea.member_id = p_member_id
      AND e.type_id IS NOT NULL

    GROUP BY ea.member_id, e.type_id;

END;
$$ LANGUAGE plpgsql;


--

CREATE OR REPLACE FUNCTION sync_member_type_stats()
RETURNS TRIGGER AS $$
BEGIN

    IF TG_OP = 'DELETE' THEN
        PERFORM refresh_member_type_stats(OLD.member_id);
        RETURN OLD;
    END IF;

    PERFORM refresh_member_type_stats(NEW.member_id);

    IF TG_OP = 'UPDATE'
       AND OLD.member_id <> NEW.member_id THEN

        PERFORM refresh_member_type_stats(OLD.member_id);

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_sync_member_type_stats
AFTER INSERT OR UPDATE OR DELETE
ON event_attendance
FOR EACH ROW
EXECUTE FUNCTION sync_member_type_stats();

-- este es para cuando un evento cambia  de tipo  si de mision pasa a ser entrenamiento

CREATE OR REPLACE FUNCTION sync_stats_on_event_type_change()
RETURNS TRIGGER AS $$
DECLARE
    v_member_id INTEGER;
BEGIN

    IF OLD.type_id IS DISTINCT FROM NEW.type_id THEN

        FOR v_member_id IN
            SELECT member_id
            FROM event_attendance
            WHERE event_id = NEW.id
        LOOP
            PERFORM refresh_member_type_stats(v_member_id);
        END LOOP;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_event_type_change
AFTER UPDATE OF type_id
ON events
FOR EACH ROW
EXECUTE FUNCTION sync_stats_on_event_type_change();