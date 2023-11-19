
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50)
);

ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
