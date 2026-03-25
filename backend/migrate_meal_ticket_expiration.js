const db = require('./src/infrastructure/database/db');

async function runMigration() {
  try {
    console.log("Refactoring meal ticket suspension to expiration...");
    
    // Check if meal_ticket_suspend_end exists to rename it, else add expiration_date directly
    try {
      await db.query(`ALTER TABLE registrations RENAME COLUMN meal_ticket_suspend_end TO meal_ticket_expiration_date`);
    } catch (e) {
      await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meal_ticket_expiration_date DATE`);
    }
    
    try {
      await db.query(`ALTER TABLE registrations DROP COLUMN meal_ticket_suspend_start`);
    } catch (e) {
      // ignore
    }
    
    console.log("Migration successful: added expiration date to registrations.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

runMigration();
