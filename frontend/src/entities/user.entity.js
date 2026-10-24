// src/entities/user.entity.js

export class User {
  constructor({
    id,
    username,
    email = null,
    role_id = null,
    permissions = [],
    active = true,
    all_units = false,
    units = []
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role_id = role_id;
    this.permissions = permissions;
    this.active = active;
    this.all_units = all_units;
    this.units = units;
  }

  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
}