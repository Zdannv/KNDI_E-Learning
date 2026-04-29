package repository

import (
	"KNDI_E-LEARNING/internal/domains"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	insertUser           = `
		INSERT INTO users (username, email, password, role) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, created_at, updated_at`
	selectUserByID       = `
		SELECT id, username, email, password, role, created_at, updated_at 
		FROM users 
		WHERE id = $1`
	selectUserByUsername = `
		SELECT id, username, email, password, role, created_at, updated_at 
		FROM users 
		WHERE username = $1`
	usernameExist        = `
		SELECT EXISTS(SELECT 1 FROM  users WHERE username = $1)`
	emailExist           = `
		SELECT EXISTS(SELECT 1 FROM  users WHERE email = $1)`
)

type UserRepository interface {
	Create(ctx context.Context, u *domains.User) error
	FindByID(ctx context.Context, id string) (*domains.User, error)
	FindByUsername(ctx context.Context, username string) (*domains.User, error)
	UsernameExists(ctx context.Context, username string) (bool, error)
	EmailExists(ctx context.Context, email string) (bool, error)
}

type userRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) UserRepository {
	return &userRepository{pool: pool}
}

func (r *userRepository) Create(ctx context.Context, u *domains.User) error {
	err := r.pool.QueryRow(ctx, insertUser, u.Username, u.Email, u.Password, u.Role).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("UserRepo.Created: %w", err)
	}

	return nil
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*domains.User, error) {
	u := &domains.User{}
	err := r.pool.QueryRow(ctx, selectUserByID, id).
		Scan(&u.ID, &u.Username, &u.Password, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("UserRepo.FindByID: %w", err)
	}

	return u, nil
}

func (r *userRepository) FindByUsername(ctx context.Context, username string) (*domains.User, error) {
	u := &domains.User{}
	err := r.pool.QueryRow(ctx, selectUserByUsername, username).
		Scan(&u.ID, &u.Username, &u.Password, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("UserRepo.FindByUsername: %w", err)
	}

	return u, nil
}

func (r *userRepository) UsernameExists(ctx context.Context, username string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, usernameExist, username).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("UserRepo.UsernameExists: %w", err)
	}

	return exists, nil
}

func (r *userRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, emailExist, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("userRepo.EmailExists: %w", err)
	}
	return exists, nil
}