CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(60) NOT NULL,
    category VARCHAR(30) NOT NULL,
    current_stock INT NOT NULL
);

CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    product_id INT,
    transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('ADD', 'SELL', 'LOST')),
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance_stock INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
