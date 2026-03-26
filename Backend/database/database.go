package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gatordash-backend/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() error {
	var err error

	// Try to load .env file from multiple locations
	envPaths := []string{
		".env",                      // Current directory
		filepath.Join(".", ".env"),  // Explicit current directory
		filepath.Join("..", ".env"), // Parent directory
	}

	envLoaded := false
	for _, envPath := range envPaths {
		if err := godotenv.Load(envPath); err == nil {
			log.Printf("Loaded .env file from: %s", envPath)
			envLoaded = true
			break
		}
	}

	if !envLoaded {
		log.Printf("Warning: Could not load .env file, using environment variables or defaults")
	}

	// Get database connection parameters from environment variables
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "gatordash")
	port := getEnv("DB_PORT", "5432")
	sslmode := getEnv("DB_SSLMODE", "disable")

	// Trim whitespace from password
	password = strings.TrimSpace(password)

	// Log connection details
	log.Printf("Attempting to connect to PostgreSQL...")
	log.Printf("Host: %s, Port: %s, Database: %s, User: %s", host, port, dbname, user)
	if password == "" {
		log.Printf("WARNING: DB_PASSWORD is empty!")
	} else {
		log.Printf("Password length: %d characters", len(password))
	}

	// Build PostgreSQL connection string
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	// Connect to PostgreSQL database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w\nPlease check:\n1. PostgreSQL is running\n2. Database '%s' exists\n3. User '%s' has access\n4. Password is correct\n5. Port %s is correct", err, dbname, user, port)
	}

	// Auto-migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.FoodStall{},
		&models.MenuItem{},
		&models.CartItem{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("PostgreSQL database connected and migrated successfully")

	if err := seedInitialData(); err != nil {
		return fmt.Errorf("failed to seed initial data: %w", err)
	}

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// seedInitialData inserts starter food stalls and menu items when empty.
func seedInitialData() error {
	// Seed richer starter data so the frontend has enough menu items.
	const (
		targetStalls = 7
		menuPerStall = 10
	)

	stallNames := []struct {
		id          string
		name        string
		description string
	}{
		{id: "stall_1", name: "Gator Bites", description: "Burgers, fries, and quick bites"},
		{id: "stall_2", name: "Swamp Pizza", description: "Fresh pizzas and garlic bread"},
		{id: "stall_3", name: "Dockside Wings", description: "Wings, sauces, and sides"},
		{id: "stall_4", name: "Garden Grill", description: "Salads, bowls, and vegetarian options"},
		{id: "stall_5", name: "Street Tacos", description: "Tacos, burritos, and salsas"},
		{id: "stall_6", name: "Midnight Noodles", description: "Stir-fry noodles and fried rice"},
		{id: "stall_7", name: "Sweet Treats", description: "Desserts, shakes, and snacks"},
	}

	// 1) Ensure all stalls exist.
	for i := 0; i < targetStalls; i++ {
		id := stallNames[i].id
		var existing models.FoodStall
		if err := DB.First(&existing, "id = ?", id).Error; err == nil {
			continue
		}

		newStall := models.FoodStall{
			ID:          id,
			Name:        stallNames[i].name,
			Description: stallNames[i].description,
			IsActive:    true,
		}
		if err := DB.Create(&newStall).Error; err != nil {
			return err
		}
	}

	// 2) Ensure each stall has 10 menu items.
	now := time.Now()
	for i := 1; i <= targetStalls; i++ {
		stallID := fmt.Sprintf("stall_%d", i)

		for j := 1; j <= menuPerStall; j++ {
			menuID := fmt.Sprintf("menu_%d_%d", i, j)

			var existingMenu models.MenuItem
			if err := DB.First(&existingMenu, "id = ?", menuID).Error; err == nil {
				continue
			}

			priceBase := 4.99 + float64(j)*0.85 + float64(i)*0.25
			item := models.MenuItem{
				ID:          menuID,
				FoodStallID: stallID,
				Name:        fmt.Sprintf("Item %d.%d", i, j),
				Description: fmt.Sprintf("Specialty item from stall %d", i),
				Price:       priceBase,
				IsAvailable: true,
				CreatedAt:   now,
				UpdatedAt:   now,
			}
			if err := DB.Create(&item).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
