import pool from "../db/pool.js";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { User } from "../entities/user.entity.js";


/**
 * Crear un nuevo usuario.
 *
 * @returns {Promise<User>}
 */
export async function newUser({
  username,
  password,
  username,
  password,
  email = null,
  role_id = null,
  active = true,
  all_units = false,
  permissions = [],
  units = []
}) {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // 2. Crear usuario
    const result = await client.query(
      `INSERT INTO users
        (username, email, password_hash, role_id, active, all_units)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        username,
        email,
        passwordHash,
        role_id,
        active,
        all_units
      ]
    );

    const dbUser = result.rows[0];

    // 3. Asignar permisos individuales
    for (const permission of permissions) {
      await client.query(
        `INSERT INTO user_permissions (user_id, permission_id)
         SELECT $1, id
         FROM permissions
         WHERE name = $2`,
        [dbUser.id, permission]
      );
    }

    // 4. Asignar unidades
    for (const unitId of units) {
      await client.query(
        `INSERT INTO user_units (user_id, unit_id)
         VALUES ($1, $2)`,
        [dbUser.id, unitId]
      );
    }

    // 5. Confirmar cambios
    await client.query("COMMIT");

    // 6. Construir entidad User
    return new User({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      passwordHash: dbUser.password_hash,
      role_id: dbUser.role_id,
      active: dbUser.active,
      all_units: dbUser.all_units,
      permissions,
      units
    });

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}