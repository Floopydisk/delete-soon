-- Family Life Ministries Database Schema
-- Create tables for church forms digitization portal

-- Users/Members table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    church_zone VARCHAR(100),
    membership_level VARCHAR(50) DEFAULT 'Member',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Church zones/districts table
CREATE TABLE IF NOT EXISTS church_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL,
    district_pastor_name VARCHAR(100),
    district_pastor_email VARCHAR(255),
    zonal_coordinator_name VARCHAR(100),
    zonal_coordinator_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Naming and Dedication forms table
CREATE TABLE IF NOT EXISTS naming_dedication_forms (
    id SERIAL PRIMARY KEY,
    -- Parent Information
    father_name VARCHAR(100) NOT NULL,
    father_phone VARCHAR(20),
    mother_name VARCHAR(100) NOT NULL,
    mother_phone VARCHAR(20),
    home_address TEXT,
    home_telephone VARCHAR(20),
    
    -- Church Information
    church_zone_id INTEGER REFERENCES church_zones(id),
    cell_leader_name VARCHAR(100),
    district_pastor_name VARCHAR(100),
    
    -- Membership Information
    father_membership_level VARCHAR(50),
    mother_membership_level VARCHAR(50),
    father_is_member BOOLEAN DEFAULT FALSE,
    mother_is_member BOOLEAN DEFAULT FALSE,
    
    -- Baby Information
    baby_names TEXT[], -- Array of names for multiple babies
    date_of_birth DATE NOT NULL,
    sex VARCHAR(10),
    place_of_birth VARCHAR(100),
    is_twins BOOLEAN DEFAULT FALSE,
    
    -- Ceremony Details
    ceremony_type VARCHAR(20) NOT NULL CHECK (ceremony_type IN ('naming', 'dedication', 'both')),
    intended_naming_date DATE,
    intended_dedication_date DATE,
    
    -- Status and Processing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
    submitted_by INTEGER REFERENCES users(id),
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courtship forms table
CREATE TABLE IF NOT EXISTS courtship_forms (
    id SERIAL PRIMARY KEY,
    
    -- Brother Information
    brother_name VARCHAR(100) NOT NULL,
    brother_dob DATE,
    brother_age INTEGER,
    brother_blood_group VARCHAR(5),
    brother_genotype VARCHAR(5),
    brother_church VARCHAR(100),
    brother_salvation_date DATE,
    brother_department VARCHAR(50),
    brother_daystar_completed BOOLEAN DEFAULT FALSE,
    brother_daystar_level VARCHAR(50),
    brother_baptized_holy_ghost BOOLEAN DEFAULT FALSE,
    brother_baptized_date DATE,
    brother_home_address TEXT,
    brother_occupation VARCHAR(100),
    brother_phone VARCHAR(20),
    brother_email VARCHAR(255),
    brother_office_address TEXT,
    brother_marital_conviction TEXT,
    brother_previously_married BOOLEAN DEFAULT FALSE,
    brother_previous_marriage_details TEXT,
    brother_recent_relationship BOOLEAN DEFAULT FALSE,
    brother_parental_consent BOOLEAN DEFAULT FALSE,
    
    -- Sister Information
    sister_name VARCHAR(100) NOT NULL,
    sister_dob DATE,
    sister_age INTEGER,
    sister_blood_group VARCHAR(5),
    sister_genotype VARCHAR(5),
    sister_church VARCHAR(100),
    sister_salvation_date DATE,
    sister_department VARCHAR(50),
    sister_daystar_completed BOOLEAN DEFAULT FALSE,
    sister_daystar_level VARCHAR(50),
    sister_baptized_holy_ghost BOOLEAN DEFAULT FALSE,
    sister_baptized_date DATE,
    sister_home_address TEXT,
    sister_occupation VARCHAR(100),
    sister_phone VARCHAR(20),
    sister_email VARCHAR(255),
    sister_office_address TEXT,
    sister_marital_conviction TEXT,
    sister_previously_married BOOLEAN DEFAULT FALSE,
    sister_previous_marriage_details TEXT,
    sister_recent_relationship BOOLEAN DEFAULT FALSE,
    sister_parental_consent BOOLEAN DEFAULT FALSE,
    
    -- General Information
    proposed_wedding_date DATE,
    church_zone_id INTEGER REFERENCES church_zones(id),
    supervising_counselor VARCHAR(100),
    counselor_phone VARCHAR(20),
    
    -- Status and Processing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_counseling', 'completed')),
    submitted_by INTEGER REFERENCES users(id),
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    form_type VARCHAR(50) NOT NULL,
    form_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample church zones
INSERT INTO church_zones (zone_name, district_pastor_name, district_pastor_email, zonal_coordinator_name, zonal_coordinator_email) VALUES
('Zone A - Victoria Island', 'Pastor John Adebayo', 'pastor.john@daystar.org', 'Coordinator Mary', 'mary.coord@daystar.org'),
('Zone B - Ikeja', 'Pastor David Okafor', 'pastor.david@daystar.org', 'Coordinator Peter', 'peter.coord@daystar.org'),
('Zone C - Lekki', 'Pastor Sarah Johnson', 'pastor.sarah@daystar.org', 'Coordinator Grace', 'grace.coord@daystar.org'),
('Zone D - Surulere', 'Pastor Michael Eze', 'pastor.michael@daystar.org', 'Coordinator Faith', 'faith.coord@daystar.org');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_naming_forms_zone ON naming_dedication_forms(church_zone_id);
CREATE INDEX IF NOT EXISTS idx_courtship_forms_zone ON courtship_forms(church_zone_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
