package config

import (
	"encoding/json"
	"net/http"
)

type Envelope struct {
	Status	string	`json:"status"`
	Data	any		`json:"data"`
	Error	*string	`json:"error"`
}

func success(w http.ResponseWriter, status int, data any) {
	write(w, status, Envelope{
		Status: "success",
		Data: data,
		Error: nil,
	})
}

func Created(w http.ResponseWriter, data any) {
	success(w, http.StatusCreated, data)
}

func Error(w http.ResponseWriter, status int, message string) {
	write(w, status, Envelope{
		Status: "error",
		Data: nil,
		Error: &message,
	})
}

func BadRequest(w http.ResponseWriter, message string) {
	Error(w, http.StatusBadRequest, message)
}

func Unauthorized(w http.ResponseWriter, message string) {
	Error(w, http.StatusUnauthorized, message)
}

func Forbidden(w http.ResponseWriter, message string) {
	Error(w, http.StatusForbidden, message)
}

func NotFound(w http.ResponseWriter, message string) {
	Error(w, http.StatusNotFound, message)
}

func InternalError(w http.ResponseWriter) {
	msg := "An internal error occured!"
	Error(w, http.StatusInternalServerError, msg)
}

func write(w http.ResponseWriter, status int, env Envelope) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(env)
}