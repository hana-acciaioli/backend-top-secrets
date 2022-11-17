const pool = require('../utils/pool');

class Secret {
  id;
  title;
  description;
  createdAt;

  constructor(row) {
    this.id = row.id;
    this.title = row.title;
    this.description = row.description;
    this.createdAt = row.created_at;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `
    SELECT *
    FROM secrets
    `
    );
    return new Secret(rows[0]);
  }
}
module.exports = { Secret };
