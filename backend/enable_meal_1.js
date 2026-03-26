const db = require('./src/infrastructure/database/db');

async function enable() {
  try {
    console.log('Enabling can_generate_meal_ticket for ID 1...');
    await db.query('UPDATE registrations SET can_generate_meal_ticket = true WHERE id = 1');
    console.log('Update successful.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

enable();
