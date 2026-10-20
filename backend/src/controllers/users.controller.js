
// crear user
import { newUser } from "../services/users.service.js";
import { User } from "../entities/user.entity.js";

// Crear usuario
export async function userPostController(req, res) {
  try {
    const {
      username,
      password,
      email,
      role_id,
      active,
      all_units,
      permissions,
      units
    } = req.body ?? {};

    // Validar campos obligatorios
    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        ok: false,
        error: "username and password are required"
      });
    }

    // Crear usuario en la BD
    /** @type {User} */
    const user = await newUser({
      username: username.trim(),
      password,
      email,
      role_id,
      active,
      all_units,
      permissions,
      units
    });

    return res.status(201).json({
      ok: true,
      user: user.toJSON()
    });

  } catch (err) {
    console.error("Error creating user:", err);

    // Username duplicado (PostgreSQL)
    if (err?.code === "23505") {
      return res.status(409).json({
        ok: false,
        error: "username already exists"
      });
    }

    // Clave foránea inválida (ej: role_id inexistente)
    if (err?.code === "23503") {
      return res.status(400).json({
        ok: false,
        error: "invalid referenced value"
      });
    }

    return res.status(500).json({
      ok: false,
      error: "internal server error"
    });
  }
}
// editar Users
