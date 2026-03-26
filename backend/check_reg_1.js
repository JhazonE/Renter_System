const db = require('./src/infrastructure/database/db');

async function check() {
  try {
    const { rows } = await db.query('SELECT id, name, can_generate_meal_ticket FROM registrations WHERE id = 1');
    if (rows.length === 0) {
      console.log('Registration with ID 1 not found.');
      const all = await db.query('SELECT id, name, can_generate_meal_ticket FROM registrations LIMIT 5');
      console.log('Existing registrations:', all.rows);
    } else {
      console.log('Registration 1:', rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
