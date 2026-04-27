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

func NewRoute(
	cfg *config.Config,
	authSvc services.AuthService,
	materialSvc services.MaterialService,
	quizSvc services.QuizService,
	assmignmentSvc services.AssignmentService,
) http.Handler {
	route := chi.NewRouter()

	route.Use(chiMiddleware.RequestID)
	route.Use(chiMiddleware.RealIP)
	route.Use(chiMiddleware.Logger)
	route.Use(chiMiddleware.Recoverer)

	allowedOrigins := strings.Split(cfg.AllowedOrigins, ",")
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Authorization",
			"Content-Type",
			"X-Request-ID",
		},
		AllowCredentials: true,		// Allow cookies / credential
		MaxAge: 300,		// Cache preflight for 5 minutes
	})

	route.Use(corsHandler.Handler)

	authHandler 		:= handler.NewAuthHandler(authSvc)
	materialHandler 	:= handler.NewMaterialHandler(materialSvc)
	quizHandler 		:= handler.NewQuizHandler(quizSvc)
	assignmentHandler 	:= handler.NewAssignmentHandler(assmignmentSvc)

	route.Route("/api/v1", func(r chi.Router) {
		/* Public - No token required */
		r.Route("/auth", func(r chi.Router) {
			route.Post("/register", authHandler.Register)
			route.Post("/login", authHandler.Login)
		})

		/* Authenticated - Any Role */
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.Authentication(authSvc))
			
			r.Get("/materials", materialHandler.FindAll)
			r.Get("/materials/{id}", materialHandler.FindByID)

			r.Get("/quizzes", quizHandler.FindAll)
			r.Get("/quizzes/{id}", quizHandler.FindByID)
		})

		/* Authenticated - Sensei Only */
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

		/* Authenticated - Student Only */
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.Authentication(authSvc))
			r.Use(appMiddleware.RequireRole("student"))

			r.Get("/assignments/history", assignmentHandler.GetHistory)
			r.Get("/assignments/{id}", assignmentHandler.GetResult)
			r.Post("/assignments", assignmentHandler.Start)
			r.Post("/assignments/{id}/submit", assignmentHandler.Submit)
		})
	})

	return route
}