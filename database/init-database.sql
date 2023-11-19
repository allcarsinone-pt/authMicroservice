CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE users ADD COLUMN deletable BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN role_id INTEGER;
ALTER TABLE users ADD CONSTRAINT fk_role
    FOREIGN KEY (role_id) 
    REFERENCES roles (id);

INSERT INTO roles (name) VALUES ('admin');
INSERT INTO roles (name) VALUES ('stand');
INSERT INTO roles (name) VALUES ('customer');
