package handler

import (
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/middleware"
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"KNDI_E-LEARNING/package/utils"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type MaterialHandler struct {
	service services.MaterialService
}

func NewMaterialHandler(service services.MaterialService) *MaterialHandler {
	return &MaterialHandler{service: service}
}

func (h *MaterialHandler) FindAll(w http.ResponseWriter, r *http.Request) {
	materials, err := h.service.FindAll(r.Context())
	if err != nil {
		log.Printf("[Material] FindAll: %v", err)
		response.InternalError(w)
		return
	}
	response.Success(w, http.StatusOK, materials)
}

func (h *MaterialHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	m, err := h.service.FindByID(r.Context(), id)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, m)
}

func (h *MaterialHandler) Create(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.BadRequest(w, "Failed to processing form data")
		return
	}

	name := r.FormValue("name")
	desc := r.FormValue("description")

	var descriptionPtr *string
	if desc != "" {
		descriptionPtr = &desc
	}

	filePath, err := utils.UploadFile(r, "file_path", "./storage/materials")
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	req := dto.CreateMaterialRequest{
		Name: 			name,
		Description: 	descriptionPtr,
		FilePath: 		filePath,
	}

	senseiID := middleware.GetUserID(r)
	m, err := h.service.Create(r.Context(), senseiID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	response.Created(w, m)
}

func (h *MaterialHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid material id")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.BadRequest(w, "Failed to process form data")
	}

	name := r.FormValue("name")
	if name == "" {
		response.BadRequest(w, "Material name is required!")
		return
	}

	desc := r.FormValue("description")
	var descriptionPtr *string
	if desc != "" {
		descriptionPtr = &desc
	}

	var filePath *string
	uploadedPath, uploadErr := utils.UploadFile(r, "file_path", "./storage/materials")
	if uploadErr == nil {
		filePath = uploadedPath
	} else if uploadErr.Error() != "File must uploaded" {
		response.BadRequest(w, uploadErr.Error())
		return
	}

	req := dto.UpdateMaterialRequest{
		Name: 			name,
		Description: 	descriptionPtr,
		FilePath: 		filePath,
	}

	senseiID := middleware.GetUserID(r)
	m, err := h.service.Update(r.Context(), id, senseiID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	response.Success(w, http.StatusOK, m)
}

func (h *MaterialHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid material id")
		return
	}

	userID := middleware.GetUserID(r)
	if err := h.service.Delete(r.Context(), id, userID); err != nil {
		handleServiceError(w, err)
		return
	}

	response.Success(w, http.StatusOK, map[string]string{"message": "Material deleted"})
}

func (h *MaterialHandler) Download(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid material id")
		return
	}

	m, err := h.service.FindByID(r.Context(), id)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	if m.FilePath == nil || *m.FilePath == "" {
		response.BadRequest(w, "Material file is not available")
		return
	}

	filePath := *m.FilePath

	// Open the file to verify it exists
	file, err := os.Open(filePath)
	if err != nil {
		response.NotFound(w, "File not found on server")
		return
	}
	defer file.Close()

	// Extract the original filename from path
	// In UploadFile we stored it as time.Now().UnixNano() + "_" + safeOriginalFilename
	// Or time.Now().UnixNano() + ext
	baseName := filepath.Base(filePath)
	originalName := baseName
	if parts := strings.SplitN(baseName, "_", 2); len(parts) == 2 {
		originalName = parts[1]
	}

	// We can also fallback to the material name with its extension if originalName is just a number
	ext := filepath.Ext(filePath)
	// Check if originalName consists only of numbers (which was the old format, UnixNano + ext)
	isOnlyDigits := true
	baseWithoutExt := strings.TrimSuffix(originalName, ext)
	for _, char := range baseWithoutExt {
		if char < '0' || char > '9' {
			isOnlyDigits = false
			break
		}
	}
	if isOnlyDigits {
		// Replace characters that are invalid in filenames
		safeName := m.Name
		safeName = strings.ReplaceAll(safeName, "/", "-")
		safeName = strings.ReplaceAll(safeName, "\\", "-")
		safeName = strings.ReplaceAll(safeName, " ", "_")
		originalName = fmt.Sprintf("%s%s", safeName, ext)
	}

	// Set headers for download
	w.Header().Set("Content-Description", "File Transfer")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", originalName))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Expires", "0")
	w.Header().Set("Cache-Control", "must-revalidate")
	w.Header().Set("Pragma", "public")

	http.ServeFile(w, r, filePath)
}