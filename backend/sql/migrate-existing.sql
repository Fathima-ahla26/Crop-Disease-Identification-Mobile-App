-- Run ONCE on databases created with the older schema.
USE cropcare;
ALTER TABLE users MODIFY role ENUM('farmer','officer','researcher','admin') NOT NULL DEFAULT 'farmer';
ALTER TABLE users ADD COLUMN preferred_language ENUM('en','si','ta') NOT NULL DEFAULT 'en';
ALTER TABLE expert_cases ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0;
