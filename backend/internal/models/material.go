package models

import (
	"errors"

	"github.com/google/uuid"
)

type MaterialType string

const (
	MaterialTypePDF MaterialType = "pdf"
	MaterialTypePPTX MaterialType = "pptx"
)

func (mt MaterialType) Validate() error {
	switch mt {
	case MaterialTypePDF, MaterialTypePPTX:
		return nil
	default:
		return errors.New("Invalid file format!")
	}
}

type Materials struct {
	Base
	SenseiID		uuid.UUID		`gorm:"type:uuid;not null;index" json:"sensei_id"`
	Title			string			`gorm:"type:varchar(32);not null;" json:"title"`
	Description		string			`gorm:"type:text" json:"description"`
	FilePath		string			`gorm:"type:varchar(255);not null" json:"file_path"`
	FileType		MaterialType

	Sensei			*User			`gorm:"foreignKey:SenseiID" json:"sensei,omitempty"`	
}

func (Materials) TableName() string {
	return "materials"
}

func (m *Materials) Validate() error {
	if m.Title == "" {
		return errors.New("Title must not be empty!")
	}

	if m.FilePath == "" {
		return errors.New("File path must not be empty!")
	}

	return m.FileType.Validate()
}