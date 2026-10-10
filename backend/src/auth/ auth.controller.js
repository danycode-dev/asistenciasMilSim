import { authenticate, meService } from "./auth.service.js";

export async function login(req, res) {
  const { username, password } = req.body;

  const ok = await authenticate(username, password);

  if (!ok) return res.status(401).json({ error: "invalid credentials", example: { username: "pepito", password: "123" } });

  const token = ok.token;

  res.cookie("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({ ok: true, user: { id: ok.id, username: ok.username, role_id: ok.role_id, permissions: ok.permissions, all_units: ok.all_units, units: ok.units }  });
}

export function logout(req, res) {
  res.clearCookie("auth_token");
  res.json({ ok: true });
}

export async function me(req, res) {
    // provisional, la idea es consultar en bd
    //const user = { id: req.user.sub, username: "admin" };
    const user = await meService(req.user);
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user);
}