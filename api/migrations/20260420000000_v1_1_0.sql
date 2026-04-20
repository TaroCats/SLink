-- Add password column to links table
ALTER TABLE links ADD COLUMN password VARCHAR(255);

-- Add device, os, browser to visits table for better analytics
ALTER TABLE visits ADD COLUMN device VARCHAR(50);
ALTER TABLE visits ADD COLUMN os VARCHAR(50);
ALTER TABLE visits ADD COLUMN browser VARCHAR(50);