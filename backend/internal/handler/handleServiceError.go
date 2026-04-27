package handler

import (
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func handleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrorNotFound):
		response.NotFound(w, "Resource not found")

	case errors.Is(err, services.ErrorForbidden):
		response.Forbidden(w, err.Error())

	case errors.Is(err, services.ErrorInvalidCredentials):
		response.Unauthorized(w, err.Error())

	case errors.Is(err, services.ErrorUsernameTaken):
		response.BadRequest(w, err.Error())

	default:
		log.Printf("[Handler] internal error: %v", err)
		if isValidationError(err) {
			response.BadRequest(w, err.Error())
		} else {
			response.InternalError(w)
		}
	}
}

func isValidationError(err error) bool {
	return errors.Unwrap(err) == nil
}

func parseIntParam(r *http.Request, param string) (int, error) {
	return strconv.Atoi(chi.URLParam(r, param))
}