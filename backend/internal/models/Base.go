package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Base struct {
	ID			uuid.UUID		`gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt	time.Time		`gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt	time.Time		`gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt	gorm.DeletedAt	`gorm:"index" json:"deleted_at,omitempty"`
}

func (b *Base) BeforeCreate(_ *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}

	return nil
}