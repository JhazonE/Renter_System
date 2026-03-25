const db = require('./src/infrastructure/database/db');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  const email = 'admin@secureaccess.io';
  const password = 'admin123';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { rowCount } = await db.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    
    if (rowCount > 0) {
      console.log(`Successfully updated password for ${email}`);
    } else {
      console.log(`User ${email} not found. Creating user...`);
      await db.query(
        "INSERT INTO users (name, email, role, status, initials, password) VALUES ('Admin User', $1, 'Administrator', 'Active', 'AU', $2)",
        [email, hashedPassword]
      );
      console.log(`Successfully created user ${email}`);
    }
  } catch (err) {
    console.error('Error setting admin password:', err);
  } finally {
    db.pool.end();
  }
}

setAdminPassword();
