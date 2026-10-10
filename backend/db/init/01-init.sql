CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission_name TEXT NOT NULL UNIQUE
);

-- permisos para roles
CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    all_units BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
-- permisos para usuarios individuales
CREATE TABLE user_permissions (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);


CREATE TABLE ranks(
    id SERIAL PRIMARY KEY,
    rank_name TEXT NOT NULL,
    display_order INTEGER NOT NULL UNIQUE,
    short_name text NOT NULL,
    plural_name text NOT NULL
);
CREATE TABLE units(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_url TEXT
);
CREATE TABLE user_units (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, unit_id)
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    nickname TEXT NOT NULL,
    rank_id INTEGER,
    unit_id INTEGER,
    join_date DATE,
    country TEXT,
    birth_date DATE,
    deleted_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (rank_id)
        REFERENCES ranks(id)
        ON DELETE SET NULL,

    FOREIGN KEY (unit_id)
      REFERENCES units(id)
      ON DELETE SET NULL
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
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
    events_attended INTEGER DEFAULT 0,
    total_present INTEGER DEFAULT 0,
    total_absences INTEGER DEFAULT 0,
    total_justified INTEGER DEFAULT 0,

    FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE

);






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