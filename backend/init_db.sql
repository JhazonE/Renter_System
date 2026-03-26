-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    student_phone VARCHAR(50),
    parent_phone VARCHAR(50),
    room_no VARCHAR(50),
    floor_no VARCHAR(50),
    unit VARCHAR(100),
    imd VARCHAR(100),
    has_fingerprint BOOLEAN DEFAULT FALSE,
    biometric_template TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    initials VARCHAR(10),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    can_generate_meal_ticket BOOLEAN DEFAULT FALSE,
    meal_ticket_expiration_date DATE,
    meal_ticket_suspend_start DATE,
    meal_ticket_suspend_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    last_login TIMESTAMP,
    initials VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meal_tickets table
CREATE TABLE IF NOT EXISTS meal_tickets (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    meal_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Insert initial admin user
INSERT INTO users (name, email, role, status, initials)
VALUES ('Admin User', 'admin@secureaccess.io', 'Administrator', 'Active', 'AU')
ON CONFLICT (email) DO NOTHING;

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    dept VARCHAR(100),
    point VARCHAR(100),
    location VARCHAR(100),
    type VARCHAR(50),
    status VARCHAR(20),
    date DATE DEFAULT CURRENT_DATE,
    time VARCHAR(50),
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin VARCHAR(255),
    admin_id VARCHAR(100),
    type VARCHAR(100),
    details TEXT,
    sub_details TEXT,
    status VARCHAR(20),
    date VARCHAR(50),
    time VARCHAR(50),
    initials VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial mock data for audit logs
INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
SELECT 'Sarah Adams', 'ADM-9021', 'User Management', 'Approved Renter ''John Doe''', 'Access Key: BK-4412-X', 'Success', 'Oct 24, 2023', '14:32:01 UTC', 'SA'
WHERE NOT EXISTS (SELECT 1 FROM audit_logs LIMIT 1);
INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
SELECT 'Marcus Vance', 'ADM-1152', 'System Config', 'Changed OAuth Callback URL', 'Env: Production', 'Success', 'Oct 24, 2023', '13:15:44 UTC', 'MV'
WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE admin_id = 'ADM-1152' LIMIT 1);
INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
SELECT 'System Automator', 'Worker-04', 'Security Update', 'Auto-rotate Encryption Keys', 'Standard weekly rotation', 'Failed', 'Oct 24, 2023', '11:02:18 UTC', 'SY'
WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE admin_id = 'Worker-04' LIMIT 1);
INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
SELECT 'Sarah Adams', 'ADM-9021', 'Other', 'Archived Logs Prior to 2022', 'Storage Tier: Cold Archive', 'Success', 'Oct 23, 2023', '23:59:12 UTC', 'SA'
WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE details = 'Archived Logs Prior to 2022' LIMIT 1);
INSERT INTO audit_logs (admin, admin_id, type, details, sub_details, status, date, time, initials)
SELECT 'Elena Loft', 'ADM-4421', 'User Management', 'Revoked API Access for ''DevTeam-Alpha''', 'Reason: Policy Violation', 'Success', 'Oct 23, 2023', '18:22:10 UTC', 'EL'
WHERE NOT EXISTS (SELECT 1 FROM audit_logs WHERE admin_id = 'ADM-4421' LIMIT 1);
