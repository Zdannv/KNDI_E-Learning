package handler

import (
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/middleware"
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"KNDI_E-LEARNING/package/utils"
	"log"
	"net/http"
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