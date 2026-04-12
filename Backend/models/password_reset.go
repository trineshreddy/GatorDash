package models

import "time"

// PasswordReset stores a short-lived token for password recovery (integrate email in production).
type PasswordReset struct {
	ID        string    `gorm:"primaryKey" json:"-"`
	UserID    string    `gorm:"not null;index" json:"-"`
	Token     string    `gorm:"uniqueIndex;not null" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"-"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"-"`
}

func (PasswordReset) TableName() string {
	return "password_resets"
}

// ForgotPasswordRequest is the body for POST /api/forgot-password.
type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

// ResetPasswordRequest is the body for POST /api/reset-password.
type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}
