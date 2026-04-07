package dto

type RegisterRequest struct {
	Name		string		`json:"name" binding:"required,min=6,max=64"`
	Email		string		`json:"email" binding:"required,email"`
	Password	string		`json:"password" binding:"required,min=8"`
	Role		string		`json:"role" binding:"required,oneof=sensei student"`
}

type LoginRequest struct {
	Email		string		`json:"email" binding:"required,email"`
	Name		string		`json:"name" binding:"required"`
}

type AuthResponse struct {
	Token		string		`json:"token"`
	User		string		`json:"user"`
}

type UserResponse struct {
	ID			string		`json:"ID"`
	Name		string		`json:"name"`
	Email		string		`json:"email"`
	Role		string		`json:"role"`
}