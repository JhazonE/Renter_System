const db = require('./src/infrastructure/database/db');

async function runMigration() {
  try {
    console.log("Adding meal_type to meal_tickets table...");
    
    await db.query(`ALTER TABLE meal_tickets ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20) DEFAULT 'Non-Veggie'`);
    
    console.log("Migration successful: added meal_type to meal_tickets.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

runMigration();
