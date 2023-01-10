CREATE DATABASE logindashboard;

CREATE TABLE loginregister(
  id SERIAL PRIMARY KEY,
  username varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  UNIQUE (email)
);

CREATE TABLE todolist(
  id SERIAL PRIMARY KEY,
  description varchar(255) NOT NULL
);

INSERT INTO loginregister (username, email, password)
VALUES ('Javier', 'javier@gmail.com', '123456');

UPDATE loginregister SET password = '1a2b3c' WHERE email = 'javier@gmail.com';

ALTER TABLE todolist ALTER COLUMN description SET NOT NULL;
