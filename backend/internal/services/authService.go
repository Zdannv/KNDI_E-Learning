package services

import (
	"KNDI_E-LEARNING/internal/config"
	"KNDI_E-LEARNING/internal/domains"
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/repository"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID		string		`json:"user_id"`
	Role		string		`json:"role"`
	jwt.RegisteredClaims
}

type ContextKey string

const (
	ContextKeyUserId ContextKey = "UserID"
	ContextKeyRole ContextKey = "Role"
)

var (
	ErrorNotFound			= errors.New("Resource not found")
	ErrorInvalidCredentials	= errors.New("Invalid username or password")
	ErrorUsernameTaken		= errors.New("Username is already taken")
	ErrorEmailTaken			= errors.New("Email is already registered")
	ErrorInvalidToken		= errors.New("Invalid or expired token")
	ErrorForbidden			= errors.New("You do not have permission to perform this action")
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
	ParseToken(tokenStr string) (*Claims, error)
}

type authService struct {
	userRepo 	repository.UserRepository
	cfg			*config.Config
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{userRepo: userRepo, cfg: cfg}
}

func (s *authService) Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error) {
	if req.Username == "" || len(req.Username) < 3 {
		return nil, errors.New("Username must be at least 3 characters!")
	}

	if len(req.Password) < 6 {
		return nil, errors.New("Password must be at least 6 characters!")
	}

	if req.Role != "sensei" && req.Role != "student" {
		return nil, errors.New("User role must be sensei or student!")
	}

	// if req.Email == "" {
	// 	return nil, fmt.Errorf("Email is required!")
	// }

	// if !isValidEmail(req.Email) {
	// 	return nil, errors.New("Invalid email format")
	// }
	
	// emailTaken, err := s.userRepo.EmailExists(ctx, req.Email)
	// if err != nil {
	// 	return nil, fmt.Errorf("AuthService.Register email check: %w", err)
	// }
	
	// if emailTaken {
	// 	return nil, ErrorEmailTaken
	// }

	usernameExists, err := s.userRepo.UsernameExists(ctx, req.Username)
	if err != nil {
		return nil, fmt.Errorf("AuthService.Register check: %w", err)
	}

	if usernameExists {
		return nil, ErrorUsernameTaken
	}

	emailExists, err := s.userRepo.EmailExists(ctx, req.Email)

	if emailExists {
		return nil, ErrorEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("AuthService.Register hash: %w", err)
	}

	user := &domains.User{
		Username: 	req.Username,
		Email: 		req.Email,
		Password: 	string(hash),
		Role: 		req.Role,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("AuthService.Register create: %w", err)
	}

	token, err := s.signToken(user)
	if err != nil {
		return nil, err
	}

	return buildAuthResponse(user, token), nil
}

func (s *authService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	if req.Username == "" || req.Password == "" {
		return nil, fmt.Errorf("Username and Password is required!")
	}

	user, err := s.userRepo.FindByUsername(ctx, req.Username)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorInvalidCredentials
		}
		return nil, fmt.Errorf("AuthService.Login find: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, ErrorInvalidCredentials
	}

	token, err := s.signToken(user)
	if err != nil {
		return nil, err
	}

	return buildAuthResponse(user, token), nil
}

func (s *authService) ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func (t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signed method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrorInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, ErrorInvalidToken
	}

	return claims, nil
}

func (s *authService) signToken(u *domains.User) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: 	u.ID,
		Role: 		u.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: 	u.ID,
			IssuedAt: 	jwt.NewNumericDate(now),
			ExpiresAt: 	jwt.NewNumericDate(now.Add(s.cfg.JWTExpiry)),
			ID: 		uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", fmt.Errorf("AuthService.SignToken: %w", err)
	}

	return signed, nil
}

func isValidEmail(email string) bool {
	at := strings.Index(email, "@")
	if at < 1 {
		return false
	}

	dot := strings.LastIndex(email[:at], ".")
	return dot > 1 && at+dot < len(email) - 1
}

func buildAuthResponse(u *domains.User, token string) *dto.AuthResponse {
	return &dto.AuthResponse{
		Token: 		token,
		UserInfo: 	dto.UserResponse{
			ID: 		u.ID,
			Username: 	u.Username,
			Email: 		u.Email,
			Role: 		u.Role,
		},
	}
}