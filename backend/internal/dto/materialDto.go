package dto

type CreateMaterialRequest struct {
	Name			string		`json:"name"`
	Description		*string		`json:"description"`
	FilePath		*string		`json:"file_path"`
}

type UpdateMaterialRequest struct {
	Name			string		`json:"name"`
	Description		*string		`json:"description"`
	FilePath		*string		`json:"file_path"`
}