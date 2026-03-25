const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
};

const DB_NAME = process.env.DB_NAME || 'renter_systems';

const migrate = async () => {
    // 1. Connect to default 'postgres' database to create the target database
    const postgresPool = new Pool({ ...dbConfig, database: 'postgres' });
    try {
        console.log(`Checking if database "${DB_NAME}" exists...`);
        const { rows } = await postgresPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
        
        if (rows.length === 0) {
            console.log(`Creating database "${DB_NAME}"...`);
            await postgresPool.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`Database "${DB_NAME}" created successfully.`);
        } else {
            console.log(`Database "${DB_NAME}" already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err.message);
        process.exit(1);
    } finally {
        await postgresPool.end();
    }

    // 2. Connect to the target database and run the migration
    const targetPool = new Pool({ ...dbConfig, database: DB_NAME });
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'init_db.sql'), 'utf8');
        console.log('Running table migration...');
        await targetPool.query(sql);
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await targetPool.end();
    }
};

migrate();
