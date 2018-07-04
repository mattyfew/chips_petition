DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    signature TEXT
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    signature TEXT NOT NULL
);
