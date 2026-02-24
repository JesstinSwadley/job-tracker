-- name: InsertUser :one
INSERT INTO users (username, hash_password)
VALUES ($1, $2)
RETURNING *;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE username = $1 LIMIT 1;