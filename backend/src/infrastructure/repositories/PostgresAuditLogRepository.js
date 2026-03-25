class PostgresAuditLogRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll(filters = {}) {
    let query = 'SELECT * FROM audit_logs';
    const values = [];
    const whereClauses = [];

    if (filters.admin) {
      whereClauses.push(`admin ILIKE $${values.length + 1}`);
      values.push(`%${filters.admin}%`);
    }
    if (filters.type) {
      whereClauses.push(`type = $${values.length + 1}`);
      values.push(filters.type);
    }
    if (filters.status) {
      whereClauses.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(parseInt(filters.limit));
    }
    if (filters.offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(parseInt(filters.offset));
    }

    const { rows } = await this.db.query(query, values);
    return rows;
  }

  async create(logData) {
    const query = `
      INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      logData.admin,
      logData.admin_id,
      logData.type,
      logData.details,
      logData.sub_details,
      logData.status,
      logData.date,
      logData.time,
      logData.initials
    ];
    const { rows } = await this.db.query(query, values);
    return rows[0];
  }
}

module.exports = PostgresAuditLogRepository;
