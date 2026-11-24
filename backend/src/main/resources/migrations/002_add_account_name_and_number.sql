ALTER TABLE accounts
    ADD COLUMN name VARCHAR(24) NOT NULL DEFAULT '모의 계좌',
    ADD COLUMN account_number VARCHAR(32) NULL,
    ADD COLUMN opened_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

UPDATE accounts
SET account_number = CONCAT('TICK 2000-', LPAD(id, 4, '0'))
WHERE account_number IS NULL;

ALTER TABLE accounts
    ADD CONSTRAINT uk_accounts_account_number UNIQUE (account_number);
