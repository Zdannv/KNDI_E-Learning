package dto

type RegisterRequest struct {
	Username	string		`json:"username"`
	Password	string		`json:"password"`
	Role		string		`json:"role"`
}

type LoginRequest struct {
	Username	string		`json:"username"`
	Password	string		`json:"password"`
}

type AuthResponse struct {
	Token		string			`json:"token"`
	UserInfo	UserResponse	`json:"user"`
}

type UserResponse struct {
	ID			string		`json:"ID"`
	Username	string		`json:"username"`
	Role		string		`json:"role"`
}