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
	insertMaterial = `
		INSERT INTO materials (user_id, name, description, file_path)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	selectMaterialByID = `
		SELECT id, user_id, name, description, file_path, created_at, updated_at
		FROM materials
		where id = $1`

	selectAllMaterial = `
		SELECT id, user_id, name, description, file_path, created_at, updated_at
		FROM materials
		ORDER BY created_at DESC`

	selectMaterialByUserID = `
		SELECT id, user_id, name, description, file_path, created_at, updated_at
		FROM materials
		WHERE user_id = $1
		ORDER BY created_at DESC`

	updateMaterial = `
		UPDATE materials
		SET name = $1, description = $2, file_path = $3, updated_at = NOW()
		WHERE id = $4 AND user_id = $5
		RETURNING updated_at`

	deleteMaterial = `
		DELETE FROM materials WHERE id = $1 AND user_id = $2`
)

type MaterialRepository interface {
	Create(ctx context.Context, m *domains.Material) error
	FindByID(ctx context.Context, id int) (*domains.Material, error)
	FindAll(ctx context.Context) ([]domains.Material, error)
	FindByUserID(ctx context.Context, userID string) ([]domains.Material, error)
	UpdateMaterial(ctx context.Context, m *domains.Material) error
	DeleteMaterial(ctx context.Context, id int, userID string) error
}

type materialRepository struct {
	pool *pgxpool.Pool
}

func NewMaterialRepository(pool *pgxpool.Pool) MaterialRepository {
	return &materialRepository{pool: pool}
}

func (r *materialRepository) Create(ctx context.Context, m *domains.Material) error {
	err := r.pool.QueryRow(ctx, insertMaterial, 
				m.UserID, m.Name, m.Description, m.FilePath).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return fmt.Errorf("MaterialRepo.Create: %w", err)
	}

	return nil
}

func (r *materialRepository) FindByID(ctx context.Context, id int) (*domains.Material, error) {
	m := &domains.Material{}
	err := r.pool.QueryRow(ctx, selectMaterialByID, id).
				Scan(&m.ID, &m.UserID, &m.Name, &m.Description, &m.FilePath, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}

		return nil, fmt.Errorf("MaterialRepo.FindByID: %w", err)
	}

	return m, nil
}

func (r *materialRepository) FindAll(ctx context.Context) ([]domains.Material, error) {
	return r.ScanMaterial(ctx, selectAllMaterial)
}

func (r *materialRepository) FindByUserID(ctx context.Context, userID string) ([]domains.Material, error) {
	return r.ScanMaterial(ctx, selectMaterialByUserID)
}

func (r *materialRepository) ScanMaterial(ctx context.Context, query string, args ...any) ([]domains.Material, error) {
	rows, err := r.pool.Query(ctx, selectAllMaterial, args...)
	if err != nil {
		return nil, fmt.Errorf("MaterialRepo.SelectAllMaterial: %w", err)
	}

	defer rows.Close()

	var materials []domains.Material
	for rows.Next() {
		var m domains.Material
		if err := rows.Scan(
			&m.ID, &m.UserID, &m.Name, &m.Description,
			&m.FilePath, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("MaterialRepo.SelectAll: %w", err)
		}

		materials = append(materials, m)
	}

	if err:= rows.Err(); err != nil {
		return nil, fmt.Errorf("MaterialRepo.Rows: %w", err)
	}

	return materials, nil
}

func (r *materialRepository) UpdateMaterial(ctx context.Context, m *domains.Material) (error) {
	err := r.pool.QueryRow(ctx, updateMaterial, 
				m.Name, m.Description, m.FilePath, m.ID, m.UserID,
			).Scan(&m.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrorNotFound
		}

		return fmt.Errorf("MaterialRepo.Update:%w", err)
	}

	return nil
}

func (r *materialRepository) DeleteMaterial(ctx context.Context, id int, userID string) error {
	tag, err := r.pool.Exec(ctx, deleteMaterial, id, userID)
	if err != nil {
		return fmt.Errorf("MaterialRepo.DeleteMaterial: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return ErrorNotFound
	}

	return nil
}