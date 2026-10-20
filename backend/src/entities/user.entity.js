export class User {
  constructor({
    id,
    username,
    email,
    passwordHash=null,
    role_id=null,
    permissions = [],
    active=true,
    all_units=false,
    units=[]

  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role_id = role_id
    this.permissions = permissions
    this.active = active
    this.all_units= all_units
    this.units = units

  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role_id: this.role_id,
      permissions: this.permissions,
      active: this.active,
      all_units: this.all_units,
      units: this.units
    };
  }
}