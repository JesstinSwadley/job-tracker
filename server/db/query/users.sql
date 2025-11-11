-- name: InsertUser :one
INSERT INTO users (username, hash_password)
VALUES ($1, $2)
RETURNING *;

-- name: FindUserById :one
SELECT * FROM users
WHERE id = $1;

-- name: FindUserByUsername :one
SELECT * FROM users
WHERE username = $1;