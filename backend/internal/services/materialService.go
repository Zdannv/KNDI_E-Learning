package services

import (
	"KNDI_E-LEARNING/internal/domains"
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/repository"
	"context"
	"errors"
	"fmt"
)

type MaterialService interface {
	Create(ctx context.Context, senseiID string, req dto.CreateMaterialRequest) (*domains.Material, error)
	FindAll(ctx context.Context) ([]domains.Material, error)
	FindByID(ctx context.Context, id int) (*domains.Material, error)
	Update(ctx context.Context, id int, userID string, req dto.UpdateMaterialRequest) (*domains.Material, error)
	Delete(ctx context.Context, id int, senseiID string) error
}

type materialService struct {
	repo repository.MaterialRepository
}

func NewMaterialService(repo repository.MaterialRepository) MaterialService {
	return &materialService{repo: repo}
}

func (s *materialService) Create(ctx context.Context, senseiID string, req dto.CreateMaterialRequest) (*domains.Material, error) {
	if req.Name == "" {
		return nil, errors.New("Material name is required!")
	}

	m := &domains.Material{
		UserID: 		senseiID,
		Name: 			req.Name,
		Description: 	req.Description,
		FilePath: 		req.FilePath,
	}

	if err := s.repo.Create(ctx, m); err != nil {
		return nil, fmt.Errorf("MaterialService.Create: %w", err)
	}

	return m, nil
}

func (s *materialService) FindAll(ctx context.Context) ([]domains.Material, error) {
	return s.repo.FindAll(ctx)
}

func (s *materialService) FindByID(ctx context.Context, id int) (*domains.Material, error) {
	m, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, repository.ErrorNotFound
		}
		return nil, fmt.Errorf("MaterialService.FindbyID: %w", err)
	}
	return m, nil
}


func (s *materialService) Update(ctx context.Context, id int, userID string, req dto.UpdateMaterialRequest) (*domains.Material, error) {
	if req.Name == "" {
		return nil ,errors.New("Material name is required")
	}

	m := &domains.Material{
		ID: 			id,
		UserID: 		userID,
		Name: 			req.Name,
		Description: 	req.Description,
		FilePath: 		req.FilePath,
	}

	if err := s.repo.UpdateMaterial(ctx, m); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("MaterialService.Update: %w", err)
	}
	return m, nil
}

func (s *materialService) Delete(ctx context.Context, id int, userID string) error {
	if err := s.repo.DeleteMaterial(ctx, id, userID); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("MaterialService.Delete: %w", err)
	}
	return nil
} 