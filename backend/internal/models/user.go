package models

import "errors"

type UserRole string

const (
	UserRoleSensei UserRole = "sensei"
	UserRoleStudent UserRole = "student"
)

func (r UserRole) Validate() error {
	switch r {
	case UserRoleSensei, UserRoleStudent:
		return nil
	default:
		return errors.New("Role must 'sensei' or 'student'")
	}
}

type User struct {
	Base
	Name			string			`gorm:"type:varchar(64);not null" json:"name"`
	Email			string			`gorm:"type:varchar(32);not null;uniqueIndex" json:"email"`
	Password		string			`gorm:"type:varchar(255); not null" json:"-"`
	Role			UserRole		`gorm:"type:varchar(8);not null;default:'student';check:chk_role,role IN ('sensei','student')" json:"role"`

	Materials		[]Materials		`gorm:"foreignKey:SenseiID" json:"materials,omitempty"`
	Quizzes			[]Quiz			`gorm:"foreignKey:SenseiID" json:"quizzes,omitempty"`
	QuizAttempts	[]QuizAttempts	`gorm:"foreignKey:StudentID" json:"quiz_attempts,omitempty"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) IsSensei() bool {
	return  u.Role == UserRoleSensei
}

func (u *User) IsStudent() bool {
	return u.Role == UserRoleStudent
}