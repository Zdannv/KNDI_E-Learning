package handler

import (
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"encoding/json"
	"errors"
	"net/http"
)

type AuthHandler struct {
	service services.AuthService
}

func NewAuthHandler(service services.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	resp, err := h.service.Register(r.Context(), req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	response.Created(w, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	resp, err := h.service.Login(r.Context(), req)
	if err != nil {
		if errors.Is(err, services.ErrorInvalidCredentials) {
			response.Unauthorized(w, err.Error())
			return
		}
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, resp)
}