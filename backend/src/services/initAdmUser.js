import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { config } from "../config/env.js";


export async function initAdmUser() {
    if (!config.admin.name && !config.admin.password) return false;

    //  comprobar si hay porlomenos un usario en la base de datos
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT COUNT(*) FROM users");
        const userCount = parseInt(res.rows[0].count, 10);

        if (userCount > 0) {
            console.log("Admin user already exists. Skipping initialization.");
            return false;
        }

        // Crear el usuario administrador
        const hashedPassword = config.admin.hash
        const insertRes = await client.query(
            "INSERT INTO users (username, password_hash, role_id, all_units) VALUES ($1, $2, $3, $4) RETURNING id",
            [config.admin.name, hashedPassword, 1, true]
        );

        const adminUserId = insertRes.rows[0].id;
        console.log(`Admin user created with ID: ${adminUserId}`);
        return true;
    } catch (err) {
        console.error("Error initializing admin user:", err);
        return false;
    } finally {
        client.release();
    }
        

}