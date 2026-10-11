import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { config } from "../config/env.js";


export async function authenticate(username, password) {
  const client = await pool.connect();
  let user
  try{
    const res = await client.query("SELECT id, username, password_hash, role_id, all_units, active FROM users WHERE username = $1", [username]);
    console.log("authenticate result:", res);  
    if (res.rowCount === 0) return false;
    user = res.rows[0];
    if (!user.active) return false; // Check if the user is active
    

    

    const match = await bcrypt.compare(
        password,
        user.password_hash
    );
    //bcrypt.hash(password, 10).then(console.log)
    console.log("password match:", match);
    if (!match) return false;
    
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
        [user.role_id, user.id]
    );
    const permissions = permissionsRes.rows.map(
        row => row.permission_name
    );
    // Obtener unidades
    const unitsRes = await client.query(
        `SELECT unit_id
         FROM user_units
         WHERE user_id = $1`,
        [user.id]
    );

    const units = unitsRes.rows.map(row => row.unit_id);
    
    const idUser = user.id; 
    const token = jwt.sign(
        { sub: idUser },
        config.jwtSecret,
        { expiresIn: "30d" }
    );

  return { token, id: idUser, username: user.username, role_id: user.role_id, permissions: permissions, all_units: user.all_units, units: units };


  }catch (err) {
    console.error("Error during authentication:", err);
    return false;
  }     
  finally {    
    client.release();
  }


}

export async function meService(user) {

  return {
    id: user.id,
    username: user.username,
    role_id: user.role_id,
    active: user.active,
    permissions: user.permissions,
    all_units: user.all_units,
    units: user.units
  };
}