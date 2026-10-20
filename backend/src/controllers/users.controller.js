
// crear user
import { getUserById, getUsers, newUser } from "../services/users.service.js";
import { User } from "../entities/user.entity.js";

// Crear usuario
export async function userPostController(req, res) {
  /** @type {User | undefined} */
  const user = req.user
  if (!user.permissions.includes('users.create')) return res.sendStatus(403);
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


// GET /users
export async function usersGetController(req, res) {
  /** @type {User | undefined} */
  const user = req.user
  if (!user.permissions.includes('users.view')) return res.sendStatus(403);
  
  try {
    const { search = "" } = req.query;

    if (typeof search !== "string") {
      return res.status(400).json({
        ok: false,
        error: "invalid search parameter"
      });
    }

    /** @type {User[]} */
    const users = await getUsers(search);

    return res.json({
      ok: true,
      total: users.length,
      users: users.map(user => user.toJSON())
    });

  } catch (err) {
    console.error("Error getting users:", err);

    return res.status(500).json({
      ok: false,
      error: "internal server error"
    });
  }
}

// GET /users/:id
export async function userGetByIdController(req, res) {
  /** @type {User | undefined} */
  const user = req.user
  if (!user.permissions.includes('users.view')) return res.sendStatus(403);
  
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        error: "invalid user id"
      });
    }

    /** @type {User | null} */
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: "user not found"
      });
    }

    return res.json({
      ok: true,
      user: user.toJSON()
    });

  } catch (err) {
    console.error("Error getting user:", err);

    return res.status(500).json({
      ok: false,
      error: "internal server error"
    });
  }
}