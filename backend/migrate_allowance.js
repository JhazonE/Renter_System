const db = require('./src/infrastructure/database/db');

async function migrate() {
  try {
    await db.query("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS can_generate_meal_ticket BOOLEAN DEFAULT FALSE");
    console.log("Migration successful: added can_generate_meal_ticket to registrations");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
