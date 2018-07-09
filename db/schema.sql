DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    signature TEXT NOT NULL
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    url VARCHAR(255),
    age INTEGER,
    city VARCHAR(255)
);
