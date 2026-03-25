const MealTicketRepository = require('../../domain/repositories/MealTicketRepository');
const MealTicket = require('../../domain/entities/MealTicket');

class PostgresMealTicketRepository extends MealTicketRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async save(mealTicket) {
    const { rows } = await this.db.query(
      `INSERT INTO meal_tickets (
        registration_id, ticket_number, status, expires_at
      ) VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [
        mealTicket.registrationId,
        mealTicket.ticketNumber,
        mealTicket.status,
        mealTicket.expiresAt
      ]
    );
    return this._mapToEntity(rows[0]);
  }

  async getById(id) {
    const { rows } = await this.db.query('SELECT * FROM meal_tickets WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return this._mapToEntity(rows[0]);
  }

  async getByRegistrationId(registrationId) {
    const { rows } = await this.db.query(
      'SELECT * FROM meal_tickets WHERE registration_id = $1 ORDER BY generated_at DESC',
      [registrationId]
    );
    return rows.map(row => this._mapToEntity(row));
  }

  async updateStatus(id, status) {
    const { rows } = await this.db.query(
      'UPDATE meal_tickets SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (rows.length === 0) return null;
    return this._mapToEntity(rows[0]);
  }

  _mapToEntity(row) {
    return new MealTicket({
      id: row.id,
      registrationId: row.registration_id,
      ticketNumber: row.ticket_number,
      status: row.status,
      generatedAt: row.generated_at,
      expiresAt: row.expires_at
    });
  }
}

module.exports = PostgresMealTicketRepository;
