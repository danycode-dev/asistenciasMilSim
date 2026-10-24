import { User } from "../entities/user.entity.js";
import { authenticate, meService } from "./auth.service.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body ?? {};

    // Validar datos recibidos
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "username and password are required"
      });
    }

    /** @type {{ token: string, user: User } | null} */
    const ok = await authenticate(username, password);

    // Credenciales incorrectas
    if (!ok) {
      return res.status(401).json({
        error: "invalid credentials"
      });
    }

    res.cookie("auth_token", ok.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      ok: true,
      user: ok.user.toJSON()
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "internal server error"
    });
  }
}

export function logout(req, res) {
  res.clearCookie("auth_token");
  res.json({ ok: true });
}

export async function me(req, res) {
    /** @type {User | undefined} **/
    const user = req.user
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user.toJSON());
}