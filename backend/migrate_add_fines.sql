-- Run this AFTER schema.sql if you already created the database earlier.
-- Adds fine tracking columns to the borrowings table.
USE ebooknest;

ALTER TABLE borrowings
  ADD COLUMN fine_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER status,
  ADD COLUMN fine_paid BOOLEAN NOT NULL DEFAULT FALSE AFTER fine_amount;
