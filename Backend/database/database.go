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
		&models.PasswordReset{},
		&models.Order{},
		&models.OrderItem{},
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
		color       string
		imageURL    string
	}{
		{id: "stall_1", name: "Gator Bites", description: "Burgers, fries, and quick bites", color: "#0D7377", imageURL: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_2", name: "Swamp Pizza", description: "Fresh pizzas and garlic bread", color: "#FFA500", imageURL: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_3", name: "Dockside Wings", description: "Wings, sauces, and sides", color: "#FF0000", imageURL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_4", name: "Garden Grill", description: "Salads, bowls, and vegetarian options", color: "#5F8D4E", imageURL: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_5", name: "Street Tacos", description: "Tacos, burritos, and salsas", color: "#FEFFDE", imageURL: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_6", name: "Midnight Noodles", description: "Stir-fry noodles and fried rice", color: "#FFD4D4", imageURL: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80"},
		{id: "stall_7", name: "Sweet Treats", description: "Desserts, shakes, and snacks", color: "#C27BA0", imageURL: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80"},
	}

	menuCatalog := map[int][]struct {
		name        string
		description string
	}{
		1: {
			{name: "Classic Gator Burger", description: "Beef patty with cheddar, lettuce, tomato, and house sauce."},
			{name: "Crispy Chicken Sandwich", description: "Buttermilk fried chicken with pickles and ranch slaw."},
			{name: "Loaded Swamp Fries", description: "Fries topped with cheese, bacon, scallions, and spicy aioli."},
			{name: "Veggie Black Bean Burger", description: "Black bean patty with avocado spread and fresh greens."},
			{name: "Buffalo Chicken Wrap", description: "Grilled chicken, buffalo sauce, lettuce, and blue cheese."},
			{name: "Cheese Quesadilla Bites", description: "Crisp tortilla wedges served with salsa and sour cream."},
			{name: "BBQ Bacon Slider Trio", description: "Three mini burgers with barbecue sauce and crispy onions."},
			{name: "Garlic Parmesan Fries", description: "Crispy fries tossed with garlic butter and parmesan."},
			{name: "Chicken Tender Basket", description: "Golden tenders served with fries and dipping sauce."},
			{name: "Fresh Lemonade", description: "House-made lemonade served chilled."},
		},
		2: {
			{name: "Margherita Pizza", description: "Tomato sauce, fresh mozzarella, basil, and olive oil."},
			{name: "Pepperoni Classic", description: "Mozzarella, tomato sauce, and crisp pepperoni."},
			{name: "BBQ Chicken Pizza", description: "Chicken, red onion, mozzarella, and smoky barbecue sauce."},
			{name: "Veggie Supreme Pizza", description: "Peppers, onions, olives, mushrooms, and mozzarella."},
			{name: "Buffalo Ranch Pizza", description: "Buffalo chicken, ranch drizzle, and mozzarella."},
			{name: "Four Cheese Slice", description: "Mozzarella, provolone, parmesan, and ricotta."},
			{name: "Garlic Knots", description: "Soft knots brushed with garlic butter and herbs."},
			{name: "Caesar Side Salad", description: "Romaine, parmesan, croutons, and Caesar dressing."},
			{name: "Meat Lovers Pizza", description: "Pepperoni, sausage, bacon, ham, and mozzarella."},
			{name: "Cinnamon Dessert Sticks", description: "Warm cinnamon sticks with sweet icing dip."},
		},
		3: {
			{name: "Classic Buffalo Wings", description: "Crispy wings tossed in medium buffalo sauce."},
			{name: "Lemon Pepper Wings", description: "Dry-rubbed wings with bright lemon pepper seasoning."},
			{name: "Honey BBQ Wings", description: "Wings glazed in sweet and smoky barbecue sauce."},
			{name: "Garlic Parmesan Wings", description: "Wings tossed with garlic butter and parmesan."},
			{name: "Teriyaki Wings", description: "Wings glazed with sweet soy teriyaki sauce."},
			{name: "Boneless Wing Basket", description: "Boneless bites with fries and dipping sauce."},
			{name: "Celery and Ranch Cup", description: "Fresh celery sticks with cool ranch dressing."},
			{name: "Cajun Fries", description: "Fries tossed in bold Cajun seasoning."},
			{name: "Mac and Cheese Cup", description: "Creamy mac and cheese with toasted crumbs."},
			{name: "Sweet Tea", description: "Fresh-brewed sweet tea over ice."},
		},
		4: {
			{name: "Harvest Grain Bowl", description: "Brown rice, roasted vegetables, chickpeas, and tahini."},
			{name: "Grilled Chicken Caesar", description: "Romaine, grilled chicken, parmesan, and Caesar dressing."},
			{name: "Southwest Salad", description: "Greens, black beans, corn, avocado, and chipotle ranch."},
			{name: "Mediterranean Bowl", description: "Quinoa, cucumber, tomato, feta, olives, and hummus."},
			{name: "Tofu Power Bowl", description: "Crispy tofu, greens, rice, edamame, and ginger sauce."},
			{name: "Turkey Avocado Wrap", description: "Turkey, avocado, spinach, tomato, and herb mayo."},
			{name: "Caprese Panini", description: "Mozzarella, tomato, basil, and balsamic glaze."},
			{name: "Tomato Basil Soup", description: "Creamy tomato soup with fresh basil."},
			{name: "Seasonal Fruit Cup", description: "Fresh-cut seasonal fruit."},
			{name: "Green Smoothie", description: "Spinach, pineapple, banana, and apple juice."},
		},
		5: {
			{name: "Carne Asada Tacos", description: "Grilled steak tacos with onion, cilantro, and salsa verde."},
			{name: "Chicken Tinga Tacos", description: "Shredded chicken tacos with smoky tomato chipotle sauce."},
			{name: "Al Pastor Tacos", description: "Marinated pork tacos with pineapple and cilantro."},
			{name: "Veggie Street Tacos", description: "Roasted vegetables, beans, salsa, and cotija."},
			{name: "Loaded Burrito", description: "Rice, beans, cheese, salsa, and your choice of protein."},
			{name: "Chicken Quesadilla", description: "Grilled tortilla with chicken, cheese, and peppers."},
			{name: "Nachos Supreme", description: "Chips topped with queso, beans, pico, jalapenos, and crema."},
			{name: "Chips and Guacamole", description: "Fresh tortilla chips with house guacamole."},
			{name: "Elote Cup", description: "Street corn with mayo, cotija, chili, and lime."},
			{name: "Horchata", description: "Sweet cinnamon rice milk served chilled."},
		},
		6: {
			{name: "Chicken Lo Mein", description: "Stir-fried noodles with chicken and vegetables."},
			{name: "Beef Chow Fun", description: "Wide rice noodles with beef, onions, and soy glaze."},
			{name: "Vegetable Pad Thai", description: "Rice noodles, vegetables, peanuts, and tamarind sauce."},
			{name: "Spicy Garlic Noodles", description: "Noodles tossed in chili garlic sauce with scallions."},
			{name: "Shrimp Fried Rice", description: "Fried rice with shrimp, egg, peas, and carrots."},
			{name: "Tofu Teriyaki Bowl", description: "Crispy tofu over rice with teriyaki sauce."},
			{name: "Pork Dumplings", description: "Pan-seared dumplings with soy dipping sauce."},
			{name: "Spring Rolls", description: "Crispy rolls filled with vegetables and noodles."},
			{name: "Miso Soup", description: "Savory miso broth with tofu and scallions."},
			{name: "Thai Iced Tea", description: "Sweet black tea with cream served over ice."},
		},
		7: {
			{name: "Chocolate Brownie Sundae", description: "Warm brownie with vanilla ice cream and chocolate sauce."},
			{name: "Strawberry Cheesecake Cup", description: "Creamy cheesecake layered with strawberry topping."},
			{name: "Cookies and Cream Shake", description: "Vanilla shake blended with chocolate sandwich cookies."},
			{name: "Gator Blue Cupcake", description: "Vanilla cupcake with blue frosting and sprinkles."},
			{name: "Churro Bites", description: "Cinnamon sugar churro bites with caramel dip."},
			{name: "Banana Pudding Jar", description: "Banana pudding with wafers and whipped cream."},
			{name: "Ice Cream Sandwich", description: "Vanilla ice cream between two chocolate chip cookies."},
			{name: "Fruit Parfait", description: "Yogurt layered with berries and granola."},
			{name: "Mini Donut Box", description: "Fresh mini donuts tossed in powdered sugar."},
			{name: "Iced Coffee Float", description: "Cold brew with vanilla ice cream."},
		},
	}

	// 1) Ensure all stalls exist.
	for i := 0; i < targetStalls; i++ {
		stall := stallNames[i]
		id := stall.id
		var existing models.FoodStall
		if err := DB.First(&existing, "id = ?", id).Error; err == nil {
			if err := DB.Model(&existing).Updates(map[string]interface{}{
				"name":        stall.name,
				"description": stall.description,
				"color":       stall.color,
				"image_url":   stall.imageURL,
				"is_active":   true,
			}).Error; err != nil {
				return err
			}
			continue
		}

		newStall := models.FoodStall{
			ID:          id,
			Name:        stall.name,
			Description: stall.description,
			Color:       stall.color,
			ImageURL:    stall.imageURL,
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
			priceBase := 4.99 + float64(j)*0.85 + float64(i)*0.25
			menuItem := menuCatalog[i][j-1]

			var existingMenu models.MenuItem
			if err := DB.First(&existingMenu, "id = ?", menuID).Error; err == nil {
				if err := DB.Model(&existingMenu).Updates(map[string]interface{}{
					"food_stall_id": stallID,
					"name":          menuItem.name,
					"description":   menuItem.description,
					"price":         priceBase,
					"image_url":     "",
					"is_available":  true,
					"updated_at":    now,
				}).Error; err != nil {
					return err
				}
				continue
			}

			item := models.MenuItem{
				ID:          menuID,
				FoodStallID: stallID,
				Name:        menuItem.name,
				Description: menuItem.description,
				Price:       priceBase,
				ImageURL:    "",
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
