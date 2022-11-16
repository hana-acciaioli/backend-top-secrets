const pool = require('../utils/pool');

class User {
  id;
  email;
  firstName;
  lastName;
  #passwordHash;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.firstName = row.first_name;
    this.lastName = row.last_name;
    this.#passwordHash = row.password_hash;
  }

  static async insert({ firstName, lastName, email, passwordHash }) {
    const { rows } = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
      [firstName, lastName, email, passwordHash]
    );
    return new User(rows[0]);
  }
  get passwordHash() {
    return this.#passwordHash;
  }
}
module.exports = { User };
