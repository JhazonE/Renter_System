const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'renter_systems',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding renter_name column to meal_tickets...');
    await client.query(`
      ALTER TABLE meal_tickets
      ADD COLUMN IF NOT EXISTS renter_name VARCHAR(255);
    `);
    console.log('Migration complete: renter_name column added to meal_tickets.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
