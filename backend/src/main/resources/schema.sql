CREATE TABLE accounts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    name VARCHAR(24) NOT NULL,
    account_number VARCHAR(32) NULL,
    opened_at DATETIME(6) NOT NULL,
    balance LONGTEXT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_accounts_account_number UNIQUE (account_number)
);

CREATE TABLE account_transactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount LONGTEXT NOT NULL,
    transacted_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_account_transactions_account
        FOREIGN KEY (account_id) REFERENCES accounts (id)
);
