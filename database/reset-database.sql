DROP TABLE IF EXISTS user_blocked_routes;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;


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
    photo VARCHAR(100),
    postalcode VARCHAR(20),
    mobilephone VARCHAR(20),
    email VARCHAR(100) NOT NULL
);
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL
);
CREATE TABLE user_blocked_routes (
    user_id INTEGER REFERENCES users (id),
    route_id INTEGER REFERENCES routes (id)
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
INSERT INTO users (username, name, password, address, city, postalcode, mobilephone, email, deletable, role_id) VALUES ('admin', 'admin', '123456789', 'Barcelos', 'Barcelos', '1234-123', '912345678', 'admin@acio.pt', false, 1);
INSERT INTO routes (route, method) VALUES ('/users/register', 'POST');
INSERT INTO routes (route, method) VALUES ('/users/edit', 'PUT');
INSERT INTO routes (route, method) VALUES ('/users/delete', 'DELETE');