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

type AssignmentHandler struct {
	service services.AssignmentService
}

func NewAssignmentHandler(service services.AssignmentService) *AssignmentHandler {
	return &AssignmentHandler{service: service}
}

func (h *AssignmentHandler) Start(w http.ResponseWriter, r *http.Request) {
	var req dto.StartAssignment
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	studentID := middleware.GetUserID(r)
	a, err := h.service.Start(r.Context(), studentID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, a)
}

func (h *AssignmentHandler) Submit(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid assignment id")
		return
	}

	var req dto.SubmitAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	studentID := middleware.GetUserID(r)
	result, err := h.service.Submit(r.Context(), studentID, id, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, result)
}

func (h *AssignmentHandler) GetResult(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid assignment id")
		return
	}

	studentID := middleware.GetUserID(r)
	result, err := h.service.GetResult(r.Context(), studentID, id)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, result)
}

func (h *AssignmentHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	studentID := middleware.GetUserID(r)
	history, err := h.service.GetHistory(r.Context(), studentID)
	if err != nil {
		log.Printf("[Assignment] GetHistory: %v", err)
		response.InternalError(w)
		return
	}
	response.Success(w, http.StatusOK, history)
}