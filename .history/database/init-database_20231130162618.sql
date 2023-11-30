CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(50),
    postal VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100) NOT NULL
);

ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE users ADD COLUMN deletable BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN role INTEGER;
ALTER TABLE users ADD CONSTRAINT fk_role
    FOREIGN KEY (role) 
    REFERENCES roles (id);

INSERT INTO roles (name) VALUES ('admin');
INSERT INTO roles (name) VALUES ('stand');
INSERT INTO roles (name) VALUES ('customer');