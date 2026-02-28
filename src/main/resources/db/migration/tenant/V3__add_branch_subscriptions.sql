-- V3__add_branch_subscriptions.sql

ALTER TABLE branches 
ADD COLUMN subscription_plan VARCHAR(255),
ADD COLUMN subscription_duration VARCHAR(50),
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN subscription_cost NUMERIC(19, 2);
