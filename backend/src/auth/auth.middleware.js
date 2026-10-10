import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import pool from "../db/pool.js";

export async function requireAuth(req, res, next) {
    const token = req.cookies?.auth_token;

    if (!token) return res.sendStatus(401);
    const client = await pool.connect();
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        const userId = payload.sub;
        console.log("Decoded JWT payload:", payload);   
        const result = await pool.query(
            "SELECT id, username, password_hash, role_id, all_units, active FROM users WHERE id = $1 AND active = TRUE",
            [payload.sub]
        );

        if (result.rowCount === 0) {
            return res.sendStatus(401);
        }
            // Obtener permisos
        const permissionsRes = await client.query(
            `SELECT p.permission_name
             FROM permissions p
             JOIN role_permissions rp ON rp.permission_id = p.id
             WHERE rp.role_id = $1
             UNION
             SELECT p.permission_name
             FROM permissions p
             JOIN user_permissions up ON up.permission_id = p.id
             WHERE up.user_id = $2`,
            [result.rows[0].role_id, result.rows[0].id]
        );
        const permissions = permissionsRes.rows.map(
            row => row.permission_name
        );
        // Obtener unidades
        const unitsRes = await client.query(
            `SELECT unit_id
             FROM user_units
             WHERE user_id = $1`,
            [result.rows[0].id]
        );

        const units = unitsRes.rows.map(row => row.unit_id);
    

        req.user = {
            sub: result.rows[0].id, //  agrego sub para retrocompatibilidad con el resto de endpoints
            id: result.rows[0].id,
            username: result.rows[0].username,
            role_id: result.rows[0].role_id,
            active: result.rows[0].active,
            permissions: permissions,
            all_units: result.rows[0].all_units,
            units: units
        };
        next();
    } catch (err) {
        return res.sendStatus(401);
    }
}