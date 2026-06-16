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

type QuizHandler struct {
	service services.QuizService
}

func NewQuizHandler(service services.QuizService) *QuizHandler {
	return &QuizHandler{service: service}
}

func (h *QuizHandler) FindAll(w http.ResponseWriter, r *http.Request) {
	role   := middleware.GetRole(r)
	userID := middleware.GetUserID(r)
	quizzes, err := h.service.FindAll(r.Context(), role, userID)
<<<<<<< HEAD
>>>>>>> 42a59f3 (fix: fixing edit quiz and question content)
=======
>>>>>>> 2be6e01 (new)
	if err != nil {
		log.Printf("[Quiz] FindAll: %v", err)
		response.InternalError(w)
		return
	}

	response.Success(w, http.StatusOK, quizzes)
}


func (h *QuizHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid quiz id")
		return
	}

	quiz, err := h.service.FindByID(r.Context(), id, true)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, quiz)
}

func (h *QuizHandler) FindAllBySensei(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	quizzes, err := h.service.FindAllBySensei(r.Context(), userID)
	if err != nil {
		log.Printf("[Quiz] FindAllBySensei: %v", err)
		response.InternalError(w)
		return
	}
	response.Success(w, http.StatusOK, quizzes)
}


func (h *QuizHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	senseiID := middleware.GetUserID(r)
	quiz, err := h.service.Create(r.Context(), senseiID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Created(w, quiz)
}

func (h *QuizHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid quiz id")
		return
	}

	var req dto.UpdateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	senseiID := middleware.GetUserID(r)
	quiz, err := h.service.Update(r.Context(), id, senseiID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, quiz)
}

func (h *QuizHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid quiz id")
		return
	}

	senseiID := middleware.GetUserID(r)
	if err := h.service.Delete(r.Context(), id, senseiID); err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, map[string]string{"message": "quiz deleted"})
}

func (h *QuizHandler) AddQuestion(w http.ResponseWriter, r *http.Request) {
	quizID, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid quiz id")
		return
	}

	var reqs []dto.CreateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&reqs); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	senseiID := middleware.GetUserID(r)
	var createdQuestions []any
	for _, req := range reqs {
		q, err := h.service.AddQuestion(r.Context(), quizID, senseiID, req)
		if err != nil {
			handleServiceError(w, err)
			return
		}
		createdQuestions = append(createdQuestions, q)
	}

	response.Created(w, createdQuestions)
}

func (h *QuizHandler) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	questionID, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid question id")
		return
	}

	var req dto.UpdateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	senseiID := middleware.GetUserID(r)
	q, err := h.service.UpdateQuestion(r.Context(), questionID, senseiID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, q)
}

func (h *QuizHandler) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	id, err := parseIntParam(r, "id")
	if err != nil {
		response.BadRequest(w, "Invalid question id")
		return
	}

	if err := h.service.DeleteQuestion(r.Context(), id); err != nil {
		handleServiceError(w, err)
		return
	}
	response.Success(w, http.StatusOK, map[string]string{"message": "question deleted"})
}