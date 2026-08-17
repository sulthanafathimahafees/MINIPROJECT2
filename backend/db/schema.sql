-- OptiBuy PostgreSQL Database Schema for Users & Authentication
-- Schema: optibuy
-- Table: optibuy.tbl_users

CREATE SCHEMA IF NOT EXISTS optibuy;

CREATE TABLE IF NOT EXISTS optibuy.tbl_users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'SALES_PERSON', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE', 'DEACTIVATED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_reset_token_hash VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE
);

-- Index on email inside optibuy schema for fast lookup
CREATE INDEX IF NOT EXISTS idx_tbl_users_email ON optibuy.tbl_users(email);
