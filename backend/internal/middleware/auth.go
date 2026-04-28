package middleware

import (
	"KNDI_E-LEARNING/internal/services"
	"KNDI_E-LEARNING/package/response"
	"context"
	"net/http"
	"strings"
)

func Authentication(authSvc services.AuthService) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Unauthorized(w, "Authorization header is required!")
				return 
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				response.Unauthorized(w, "Authorization header must be 'bearer <token>'!")
				return 
			}

			claims, err := authSvc.ParseToken(parts[1])
			if err != nil {
				response.Unauthorized(w, "Invalid or expired token!")
				return
			}

			ctx := context.WithValue(r.Context(), services.ContextKeyUserId, claims.UserID)
			ctx = context.WithValue(ctx, services.ContextKeyRole, claims.Role)
			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireRole(allowedRoles...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = true
	}

	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(services.ContextKeyRole).(string)
			if !ok || !allowed[role] {
				response.Forbidden(w, "You don't have permission to access this resource")
				return 
			}
			h.ServeHTTP(w, r)
		})
	}
}

func GetUserID(r *http.Request) string {
	id, _ := r.Context().Value(services.ContextKeyUserId).(string)
	return id
}

func GetRole(r *http.Request) string {
	role, _ := r.Context().Value(services.ContextKeyRole).(string)
	return role
}