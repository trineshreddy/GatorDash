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
	var stallCount int64
	if err := DB.Model(&models.FoodStall{}).Count(&stallCount).Error; err != nil {
		return err
	}
	if stallCount > 0 {
		return nil
	}

	stalls := []models.FoodStall{
		{ID: "stall_1", Name: "Gator Bites", Description: "Burgers, fries, and quick bites", IsActive: true},
		{ID: "stall_2", Name: "Swamp Pizza", Description: "Fresh pizzas and garlic bread", IsActive: true},
	}
	if err := DB.Create(&stalls).Error; err != nil {
		return err
	}

	now := time.Now()
	menuItems := []models.MenuItem{
		{ID: fmt.Sprintf("menu_%d", now.UnixNano()), FoodStallID: "stall_1", Name: "Classic Burger", Description: "Beef patty with cheese", Price: 9.99, IsAvailable: true},
		{ID: fmt.Sprintf("menu_%d", now.UnixNano()+1), FoodStallID: "stall_1", Name: "Crispy Fries", Description: "Salted potato fries", Price: 3.99, IsAvailable: true},
		{ID: fmt.Sprintf("menu_%d", now.UnixNano()+2), FoodStallID: "stall_2", Name: "Pepperoni Pizza", Description: "12-inch pepperoni pizza", Price: 12.49, IsAvailable: true},
		{ID: fmt.Sprintf("menu_%d", now.UnixNano()+3), FoodStallID: "stall_2", Name: "Veggie Pizza", Description: "12-inch veggie pizza", Price: 11.49, IsAvailable: true},
	}
	return DB.Create(&menuItems).Error
}
