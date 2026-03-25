const db = require('./src/infrastructure/database/db');

async function runMigration() {
  try {
    console.log("Adding meal_ticket_suspend_start and meal_ticket_suspend_end to registrations table...");
    
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meal_ticket_suspend_start DATE`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meal_ticket_suspend_end DATE`);
    
    console.log("Migration successful: added suspension date columns to registrations.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

runMigration();
