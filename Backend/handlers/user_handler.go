package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"

	"gatordash-backend/models"
	"gatordash-backend/store"
	"gatordash-backend/utils"

	"github.com/gin-gonic/gin"
)

// UserHandler handles all user-related HTTP requests
type UserHandler struct {
	userStore *store.UserStore
}

// NewUserHandler creates a new user handler
func NewUserHandler(userStore *store.UserStore) *UserHandler {
	return &UserHandler{
		userStore: userStore,
	}
}

// SignUp handles user registration
func (h *UserHandler) SignUp(c *gin.Context) {
	var req models.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Phone == "" || req.Password == "" {
		utils.SendError(c, 400, "All fields are required")
		return
	}

	// Check if user already exists
	if _, exists := h.userStore.GetUserByEmail(req.Email); exists {
		utils.SendError(c, 409, "User with this email already exists")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(c, 500, "Failed to hash password")
		return
	}

	// Create user
	now := time.Now()
	user := &models.User{
		ID:        fmt.Sprintf("user_%d", now.UnixNano()),
		Name:      req.Name,
		Email:     req.Email,
		Phone:     req.Phone,
		Password:  string(hashedPassword),
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.userStore.CreateUser(user); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	// Return user without password
	userResponse := *user
	userResponse.Password = ""

	utils.SendSuccess(c, "User registered successfully", userResponse)
}

// SignIn handles user authentication
func (h *UserHandler) SignIn(c *gin.Context) {
	var req models.SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		utils.SendError(c, 400, "Email and password are required")
		return
	}

	// Get user by email
	user, exists := h.userStore.GetUserByEmail(req.Email)
	if !exists {
		utils.SendError(c, 401, "Invalid email or password")
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.SendError(c, 401, "Invalid email or password")
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Name, user.Phone)
	if err != nil {
		utils.SendError(c, 500, "Failed to generate token")
		return
	}

	// Return user data with token
	response := gin.H{
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"phone": user.Phone,
		},
		"token": token,
	}

	utils.SendSuccess(c, "Sign in successful", response)
}

const passwordResetTokenBytes = 32
const passwordResetTTL = time.Hour

// ForgotPassword issues a short-lived reset token for the account (send via email in production).
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}
	if req.Email == "" {
		utils.SendError(c, 400, "Email is required")
		return
	}

	user, exists := h.userStore.GetUserByEmail(req.Email)
	if !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	if err := h.userStore.DeletePasswordResetsByUserID(user.ID); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	buf := make([]byte, passwordResetTokenBytes)
	if _, err := rand.Read(buf); err != nil {
		utils.SendError(c, 500, "Failed to generate reset token")
		return
	}
	token := hex.EncodeToString(buf)
	expiresAt := time.Now().Add(passwordResetTTL)
	now := time.Now()

	pr := &models.PasswordReset{
		ID:        fmt.Sprintf("pr_%d", now.UnixNano()),
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}
	if err := h.userStore.CreatePasswordReset(pr); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Password reset token issued", map[string]interface{}{
		"reset_token": token,
		"expires_at":  expiresAt.UTC().Format(time.RFC3339),
	})
}

// ResetPassword completes password recovery using a valid token.
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}
	if req.Token == "" || req.NewPassword == "" {
		utils.SendError(c, 400, "token and new_password are required")
		return
	}

	pr, ok := h.userStore.FindValidPasswordReset(req.Token)
	if !ok {
		utils.SendError(c, 400, "Invalid or expired reset token")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(c, 500, "Failed to hash password")
		return
	}

	if err := h.userStore.UpdateUserPassword(pr.UserID, string(hashedPassword)); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	_ = h.userStore.DeletePasswordResetsByUserID(pr.UserID)

	utils.SendSuccess(c, "Password reset successfully", nil)
}

// GetUser retrieves a user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")

	if userID == "" {
		utils.SendError(c, 400, "User ID is required")
		return
	}

	user, exists := h.userStore.GetUserByID(userID)
	if !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	// Return user without password
	userResponse := *user
	userResponse.Password = ""

	utils.SendSuccess(c, "User retrieved successfully", userResponse)
}

// GetAllUsers retrieves all users
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userStore.GetAllUsers()
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	// Remove passwords from response
	usersResponse := make([]models.User, len(users))
	for i, user := range users {
		usersResponse[i] = user
		usersResponse[i].Password = ""
	}

	utils.SendSuccess(c, "Users retrieved successfully", usersResponse)
}

// UpdateUser updates user information
func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	if userID == "" {
		utils.SendError(c, 400, "User ID is required")
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}

	// Check if user exists
	_, exists := h.userStore.GetUserByID(userID)
	if !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	// Prepare update object
	updates := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Password: req.Password,
	}

	// Hash password if provided
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.SendError(c, 500, "Failed to hash password")
			return
		}
		updates.Password = string(hashedPassword)
	}

	// Update user
	if err := h.userStore.UpdateUser(userID, updates); err != nil {
		utils.SendError(c, 400, err.Error())
		return
	}

	// Get updated user
	updatedUser, _ := h.userStore.GetUserByID(userID)
	userResponse := *updatedUser
	userResponse.Password = ""

	utils.SendSuccess(c, "User updated successfully", userResponse)
}

// DeleteUser deletes a user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	if userID == "" {
		utils.SendError(c, 400, "User ID is required")
		return
	}

	if err := h.userStore.DeleteUser(userID); err != nil {
		utils.SendError(c, 404, err.Error())
		return
	}

	utils.SendSuccess(c, "User deleted successfully", nil)
}
