class PostgresAccessLogRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const query = 'SELECT * FROM access_logs ORDER BY created_at DESC';
    const { rows } = await this.db.query(query);
    return rows;
  }

  // Recent meal-ticket alerts for one renter (matched by registration name),
  // used by the web alerts page. Only the notification-worthy log types.
  async getByRenterName(name, limit = 30) {
    const query = `
      SELECT id, name, type, status, date, time, created_at
      FROM access_logs
      WHERE name = $1 AND type IN ('Biometric Scan', 'Manual Ticket')
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const { rows } = await this.db.query(query, [name, limit]);
    return rows;
  }

  async create(logData) {
    const query = `
      INSERT INTO access_logs (name, dept, point, location, type, status, date, time, avatar, push_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      logData.name,
      logData.dept,
      logData.point,
      logData.location,
      logData.type,
      logData.status,
      logData.date,
      logData.time,
      logData.avatar,
      logData.pushStatus || 'Not Sent'
    ];
    const { rows } = await this.db.query(query, values);
    return rows[0];
  }
}

module.exports = PostgresAccessLogRepository;
