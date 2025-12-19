-- Doctor-Patient Management System Database Initialization

-- Create database if not exists (handled by docker-compose)
-- This file is for additional initialization if needed

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Grant all privileges to the application user
GRANT ALL PRIVILEGES ON doctor_patient_db.* TO 'doctor_patient_user'@'%';
FLUSH PRIVILEGES;

