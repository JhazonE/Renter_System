const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'renter_systems',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function migrateEmailNullable() {
    try {
        console.log('Altering "users" table to make "email" nullable...');
        await pool.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
        
        // Also remove the UNIQUE constraint if we want to allow multiple NULLs or if we don't care about email uniqueness anymore
        // Actually, NULLs in a UNIQUE column in Postgres are treated as distinct, so multiple NULLs are allowed.
        // But if they reuse an old email later, it might still need to be unique.
        // For now, making it nullable is enough.
        
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrateEmailNullable();
