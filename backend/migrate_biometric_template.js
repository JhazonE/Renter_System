const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'renter_systems',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function migrateBiometricTemplate() {
    try {
        console.log('Altering "registrations" table to add "biometric_template" column...');
        
        // Check if the column already exists
        const { rows } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'registrations' AND column_name = 'biometric_template'
        `);
        
        if (rows.length === 0) {
            await pool.query('ALTER TABLE registrations ADD COLUMN biometric_template TEXT');
            console.log('Column "biometric_template" added successfully.');
        } else {
            console.log('Column "biometric_template" already exists.');
        }
        
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrateBiometricTemplate();
