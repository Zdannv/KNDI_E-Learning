package router

import (
	"KNDI_E-LEARNING/internal/config"
	"KNDI_E-LEARNING/internal/handler"
	appMiddleware "KNDI_E-LEARNING/internal/middleware"
	"KNDI_E-LEARNING/internal/services"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"
)

func Route(
	cfg *config.Config,
	authSvc services.AuthService,
	materialSvc services.MaterialService,
	quizSvc services.QuizService,
	assmignmentSvc services.AssignmentService,
) http.Handler {
	r := chi.NewRouter()

	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	authHandler			:= handler.NewAuthHandler(authSvc)
	materialHandler		:= handler.NewMaterialHandler(materialSvc)
	quizHandler			:= handler.NewQuizHandler(quizSvc)
	assignmentHandler	:= handler.NewAssignmentHandler(assmignmentSvc)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status": "ok"}`))
	})

	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.Authentication(authSvc))

			r.Get("/materials", materialHandler.FindAll)
			r.Get("/materials/{id}", materialHandler.FindByID)

			r.Get("/quizzes", quizHandler.FindAll)
			r.Get("/quizzes/{id}", quizHandler.FindByID)
		})

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.Authentication(authSvc))
			r.Use(appMiddleware.RequireRole("sensei"))

			r.Post("/materials", materialHandler.Create)
			r.Put("/materials/{id}", materialHandler.Update)
			r.Delete("/materials/{id}", materialHandler.Delete)

			r.Post("/quizzes", quizHandler.Create)
			r.Put("/quizzes/{id}", quizHandler.Update)
			r.Delete("/quizzes/{id}", quizHandler.Delete)

			r.Post("/quizzes/{id}/questions", quizHandler.AddQuestion)
			r.Delete("/questions/{id}", quizHandler.DeleteQuestion)
		})

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.Authentication(authSvc))
			r.Use(appMiddleware.RequireRole("student"))

			r.Get("/assignments/history", assignmentHandler.GetHistory)

			r.Post("/assignment", assignmentHandler.Start)
			r.Post("/assignments/{id}/submit", assignmentHandler.Submit)
			r.Get("/assignments/{id}", assignmentHandler.GetResult)
		})
	})

	allowedOrigins := strings.Split(cfg.AllowedOrigins, ",")
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodPatch,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Authorization",
			"Content-Type",
			"X-Request-ID",
		},
		AllowCredentials: true,
		MaxAge: 300,	// 5 Minutes
	})

	return corsHandler.Handler(r)
}