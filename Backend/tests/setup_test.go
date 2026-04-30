package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gatordash-backend/database"
	"gatordash-backend/handlers"
	"gatordash-backend/models"
	"gatordash-backend/routes"
	"gatordash-backend/store"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type apiResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func setupTestRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	dbName := strings.ReplaceAll(t.Name(), "/", "_")
	dsn := "file:" + dbName + "?mode=memory&cache=shared"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite test DB: %v", err)
	}

	database.DB = db
	if err := db.AutoMigrate(&models.User{}, &models.FoodStall{}, &models.MenuItem{}, &models.CartItem{}, &models.PasswordReset{}, &models.Order{}, &models.OrderItem{}); err != nil {
		t.Fatalf("failed to migrate test DB: %v", err)
	}

	userStore := store.NewUserStore()
	foodStore := store.NewFoodStore()

	userHandler := handlers.NewUserHandler(userStore)
	foodHandler := handlers.NewFoodHandler(foodStore, userStore)

	return routes.SetupRoutes(userHandler, foodHandler), db
}

func performRequest(router *gin.Engine, method, url string, body interface{}) *httptest.ResponseRecorder {
	var b []byte
	if body != nil {
		b, _ = json.Marshal(body)
	}

	req, _ := http.NewRequest(method, url, bytes.NewBuffer(b))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func parseResponse(t *testing.T, w *httptest.ResponseRecorder) apiResponse {
	t.Helper()

	var resp apiResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	return resp
}

func seedFoodData(t *testing.T, db *gorm.DB) {
	t.Helper()

	stalls := []models.FoodStall{
		{ID: "stall_1", Name: "Gator Bites", Description: "Burgers and fries", Color: "#0D7377", ImageURL: "https://images.unsplash.com/photo-1551782450-17144efb5723?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_2", Name: "Swamp Pizza", Description: "Pizza and sides", Color: "#FFA500", ImageURL: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_3", Name: "Dockside Wings", Description: "Wings and sauces", Color: "#FF0000", ImageURL: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_4", Name: "Garden Grill", Description: "Salads and bowls", Color: "#5F8D4E", ImageURL: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_5", Name: "Street Tacos", Description: "Tacos and burritos", Color: "#FEFFDE", ImageURL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_6", Name: "Midnight Noodles", Description: "Noodles and rice", Color: "#FFD4D4", ImageURL: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80", IsActive: true},
		{ID: "stall_7", Name: "Sweet Treats", Description: "Desserts and snacks", Color: "#C27BA0", ImageURL: "https://images.unsplash.com/photo-1542827630-8e21ebdf8a92?auto=format&fit=crop&w=600&q=80", IsActive: true},
	}
	if err := db.Create(&stalls).Error; err != nil {
		t.Fatalf("failed to seed stalls: %v", err)
	}

	// Seed 10 menu items per stall.
	itemNames := [][]string{
		{
			"Classic Gator Burger",
			"Cheddar Bacon Burger",
			"Spicy Gator Burger",
			"Mushroom Swiss Burger",
			"BBQ Ranch Burger",
			"Avocado Toast Burger",
			"Cajun Chicken Sandwich",
			"Gator Sliders",
			"Double Gator Melt",
			"Crispy Fish Po' Boy",
		},
		{
			"Margherita Pizza",
			"Pepperoni Passion Pizza",
			"Hawaiian Pineapple Pizza",
			"Four Cheese Delight",
			"BBQ Chicken Pizza",
			"Veggie Supreme Pizza",
			"Meat Lovers Pizza",
			"Buffalo Chicken Pizza",
			"Spinach Artichoke Pizza",
			"Garlic Herb Breadsticks",
		},
		{
			"Buffalo Wings",
			"Honey BBQ Wings",
			"Garlic Parmesan Wings",
			"Teriyaki Wings",
			"Spicy Mango Wings",
			"Classic Drumsticks",
			"Crispy Boneless Wings",
			"Smoked BBQ Wings",
			"Lemon Pepper Wings",
			"Wing Platter Sampler",
		},
		{
			"Mediterranean Salad",
			"Cobb Power Bowl",
			"Kale Caesar Salad",
			"Southwest Chicken Bowl",
			"Quinoa Harvest Bowl",
			"Teriyaki Tofu Bowl",
			"Greek Grain Bowl",
			"Avocado Citrus Salad",
			"Berry Almond Salad",
			"Roasted Veggie Wrap",
		},
		{
			"Carne Asada Taco",
			"Chicken Al Pastor Taco",
			"Fish Street Taco",
			"Shrimp Baja Taco",
			"Veggie Fajita Burrito",
			"Chipotle Steak Burrito",
			"Carnitas Quesadilla",
			"Street Corn Bowl",
			"Churro Bites",
			"Salsa Trio Sampler",
		},
		{
			"Chicken Lo Mein",
			"Beef Chow Fun",
			"Spicy Sesame Noodles",
			"Vegetable Stir Fry",
			"Shrimp Fried Rice",
			"General Tso's Chicken",
			"Teriyaki Beef Bowl",
			"Kung Pao Noodles",
			"Thai Basil Noodles",
			"Miso Soup",
		},
		{
			"Chocolate Brownie Sundae",
			"Vanilla Cheesecake Slice",
			"Strawberry Shortcake",
			"Mango Sorbet",
			"Cinnamon Sugar Donuts",
			"Caramel Popcorn",
			"Cookie Ice Cream Sandwich",
			"Lemon Tart",
			"Nutella Crepes",
			"Fruit Parfait",
		},
	}

	itemDescriptions := [][]string{
		{
			"Grass-fed beef patty with lettuce, tomato, and signature sauce.",
			"Smoked bacon and cheddar on a juicy beef patty.",
			"House-spiced burger with zesty jalapeño mayo.",
			"Swiss cheese and sautéed mushrooms on a premium burger.",
			"BBQ sauce, crispy onions, and ranch drizzle.",
			"Fresh avocado, tomato, and herb mayo on toasted brioche.",
			"Grilled chicken with cajun seasoning and crisp slaw.",
			"Three mini burgers with pickles and special sauce.",
			"Double patty melt with caramelized onions and cheese.",
			"Crispy fried fish with tangy slaw and remoulade.",
		},
		{
			"Classic tomato, fresh basil, and mozzarella pizza.",
			"Loaded pepperoni with extra cheese on a thin crust.",
			"Sweet pineapple and ham with a tangy tomato base.",
			"Four cheeses blended over house-made crust.",
			"Grilled chicken, BBQ sauce, and red onion.",
			"Roasted peppers, olives, and fresh vegetables.",
			"Sausage, bacon, and pepperoni for meat lovers.",
			"Buffalo sauce chicken with celery and ranch swirl.",
			"Creamy spinach, artichoke, and garlic topping.",
			"Warm garlic breadsticks with herb butter.",
		},
		{
			"Classic buffalo wings tossed in tangy hot sauce.",
			"Sweet honey BBQ wings with a smoky finish.",
			"Garlic Parmesan wings with shaved parmesan.",
			"Teriyaki glazed wings with sesame and green onion.",
			"Mango hot sauce wings with a sweet-spicy kick.",
			"Juicy drumsticks seasoned and grilled to perfection.",
			"Breaded boneless wings with house dipping sauce.",
			"Slow-smoked wings in rich BBQ sauce.",
			"Lemon pepper wings with crispy skin and herbs.",
			"Sampler platter with three wing flavors.",
		},
		{
			"Mixed greens with feta, olives, and lemon vinaigrette.",
			"Protein-packed salad with turkey, egg, and avocado.",
			"Kale tossed in creamy Caesar dressing.",
			"Grilled chicken, black beans, and corn salsa.",
			"Quinoa, roasted veggies, and herb dressing.",
			"Teriyaki tofu with steamed greens and rice.",
			"Greek-inspired bowl with cucumber and tzatziki.",
			"Avocado, citrus, and crisp greens with poppyseed dressing.",
			"Fresh berries, almonds, and creamy yogurt.",
			"Roasted vegetables wrapped in a spinach tortilla.",
		},
		{
			"Grilled steak taco with cilantro, onion, and lime.",
			"Slow-roasted chicken with pineapple salsa.",
			"Crispy fish taco with cabbage slaw and crema.",
			"Spicy shrimp with baja slaw and chipotle sauce.",
			"Seasoned vegetables wrapped with rice and beans.",
			"Steak, rice, beans, and chipotle crema burrito.",
			"Cheese-filled quesadilla with carnitas.",
			"Roasted corn with cotija cheese and lime.",
			"Mini churros dusted in cinnamon sugar.",
			"Fresh pico, guacamole, and three salsas.",
		},
		{
			"Stir-fried chicken with noodles and veggies.",
			"Wide noodles with tender beef and soy glaze.",
			"Spicy sesame noodles with scallions and peanuts.",
			"Crisp vegetables in savory stir-fry sauce.",
			"Fried rice with shrimp, peas, and carrots.",
			"Crispy chicken in sweet-spicy General Tso sauce.",
			"Beef strips in teriyaki glaze over rice.",
			"Kung Pao noodles with peanuts and peppers.",
			"Thai basil noodles with fragrant herbs.",
			"Warm broth with tofu and seaweed.",
		},
		{
			"Chocolate brownie served with vanilla ice cream.",
			"Classic cheesecake with a buttery graham crust.",
			"Fresh strawberries layered with cream.",
			"Smooth mango sorbet with tropical flavor.",
			"Mini donuts dusted with cinnamon sugar.",
			"Sweet caramel popcorn with a crunchy bite.",
			"Chocolate chip cookies with ice cream filling.",
			"Tart lemon custard in a crisp crust.",
			"Warm crepes filled with Nutella and berries.",
			"Layered fruit parfait with granola and cream.",
		},
	}

	menu := make([]models.MenuItem, 0, 70)
	for i := 1; i <= 7; i++ {
		stallID := fmt.Sprintf("stall_%d", i)
		for j := 1; j <= 10; j++ {
			menuID := fmt.Sprintf("menu_%d", (i-1)*10+j)
			menu = append(menu, models.MenuItem{
				ID:          menuID,
				FoodStallID: stallID,
				Name:        itemNames[i-1][j-1],
				Description: itemDescriptions[i-1][j-1],
				Price:       5.0 + float64(j)*0.75 + float64(i)*0.25,
				ImageURL:    fmt.Sprintf("https://picsum.photos/seed/%s/300/220", menuID),
				IsAvailable: true,
			})
		}
	}

	if err := db.Create(&menu).Error; err != nil {
		t.Fatalf("failed to seed menu: %v", err)
	}
}
