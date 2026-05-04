package handler

import (
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/middleware"
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"encoding/json"
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
	var req dto.CreateMaterialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid body request")
		return
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

	var req dto.UpdateMaterialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid body request")
		return
	}

	userID := middleware.GetUserID(r)
	m, err := h.service.Update(r.Context(), id, userID, req)
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