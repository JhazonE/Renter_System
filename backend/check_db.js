const db = require('./src/infrastructure/database/db');

async function check() {
  try {
    const { rows } = await db.query("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = 'registrations'");
    console.log(JSON.stringify(rows.map(r => r.column_name)));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
