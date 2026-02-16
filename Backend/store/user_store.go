package store
import (
	"fmt"
	"time"

	"gatordash-backend/database"
	"gatordash-backend/models"

	"gorm.io/gorm"
)

// UserStore manages users in the database
type UserStore struct {
	db *gorm.DB
}

// NewUserStore creates a new user store
func NewUserStore() *UserStore {
	return &UserStore{
		db: database.GetDB(),
	}
}

// CreateUser adds a new user to the database
func (s *UserStore) CreateUser(user *models.User) error {
	// Check if user with email already exists
	var existingUser models.User
	result := s.db.Where("email = ?", user.Email).First(&existingUser)
	if result.Error == nil {
		return fmt.Errorf("user with email %s already exists", user.Email)
	}

	// Create user
	result = s.db.Create(user)
	if result.Error != nil {
		return fmt.Errorf("failed to create user: %w", result.Error)
	}

	return nil
}

// GetUserByEmail retrieves a user by email
func (s *UserStore) GetUserByEmail(email string) (*models.User, bool) {
	var user models.User
	result := s.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, false
	}
	return &user, true
}

// GetUserByID retrieves a user by ID
func (s *UserStore) GetUserByID(id string) (*models.User, bool) {
	var user models.User
	result := s.db.First(&user, "id = ?", id)
	if result.Error != nil {
		return nil, false
	}
	return &user, true
}

// GetAllUsers retrieves all users from the database
func (s *UserStore) GetAllUsers() ([]models.User, error) {
	var users []models.User
	result := s.db.Find(&users)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get users: %w", result.Error)
	}
	return users, nil
}

// UpdateUser updates an existing user
func (s *UserStore) UpdateUser(id string, updates *models.User) error {
	var user models.User
	result := s.db.First(&user, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("user with id %s not found", id)
	}

	// Update fields if provided
	if updates.Name != "" {
		user.Name = updates.Name
	}
	if updates.Phone != "" {
		user.Phone = updates.Phone
	}
	if updates.Email != "" && updates.Email != user.Email {
		// Check if new email already exists
		var existingUser models.User
		checkResult := s.db.Where("email = ?", updates.Email).First(&existingUser)
		if checkResult.Error == nil {
			return fmt.Errorf("email %s already in use", updates.Email)
		}
		user.Email = updates.Email
	}
	if updates.Password != "" {
		user.Password = updates.Password
	}

	// Update timestamp
	user.UpdatedAt = time.Now()

	// Save changes
	result = s.db.Save(&user)
	if result.Error != nil {
		return fmt.Errorf("failed to update user: %w", result.Error)
	}

	return nil
}

// DeleteUser removes a user from the database
func (s *UserStore) DeleteUser(id string) error {
	var user models.User
	result := s.db.First(&user, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("user with id %s not found", id)
	}

	result = s.db.Delete(&user)
	if result.Error != nil {
		return fmt.Errorf("failed to delete user: %w", result.Error)
	}

	return nil
}
