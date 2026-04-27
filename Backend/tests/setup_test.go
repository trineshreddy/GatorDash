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
		{ID: "stall_1", Name: "Gator Bites", Description: "Burgers and fries", IsActive: true},
		{ID: "stall_2", Name: "Swamp Pizza", Description: "Pizza and sides", IsActive: true},
		{ID: "stall_3", Name: "Dockside Wings", Description: "Wings and sauces", IsActive: true},
		{ID: "stall_4", Name: "Garden Grill", Description: "Salads and bowls", IsActive: true},
		{ID: "stall_5", Name: "Street Tacos", Description: "Tacos and burritos", IsActive: true},
		{ID: "stall_6", Name: "Midnight Noodles", Description: "Noodles and rice", IsActive: true},
		{ID: "stall_7", Name: "Sweet Treats", Description: "Desserts and snacks", IsActive: true},
	}
	if err := db.Create(&stalls).Error; err != nil {
		t.Fatalf("failed to seed stalls: %v", err)
	}

	// Seed 10 menu items per stall.
	menu := make([]models.MenuItem, 0, 70)
	for i := 1; i <= 7; i++ {
		stallID := fmt.Sprintf("stall_%d", i)
		for j := 1; j <= 10; j++ {
			// Keep menu_1 and menu_2 as part of stall_1 (required by cart tests).
			menuID := fmt.Sprintf("menu_%d", (i-1)*10+j)
			menu = append(menu, models.MenuItem{
				ID:          menuID,
				FoodStallID: stallID,
				Name:        fmt.Sprintf("Item %d.%d", i, j),
				Description: fmt.Sprintf("Specialty item from stall %d", i),
				Price:       5.0 + float64(j)*0.75 + float64(i)*0.25,
				IsAvailable: true,
			})
		}
	}

	if err := db.Create(&menu).Error; err != nil {
		t.Fatalf("failed to seed menu: %v", err)
	}
}
