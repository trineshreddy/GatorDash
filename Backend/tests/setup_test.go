package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gatordash-backend/database"
	"gatordash-backend/handlers"
	"gatordash-backend/models"
	"gatordash-backend/routes"
	"gatordash-backend/store"

	"github.com/glebarez/sqlite"
	"github.com/gin-gonic/gin"
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
	if err := db.AutoMigrate(&models.User{}, &models.FoodStall{}, &models.MenuItem{}, &models.CartItem{}); err != nil {
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
	}
	if err := db.Create(&stalls).Error; err != nil {
		t.Fatalf("failed to seed stalls: %v", err)
	}

	menu := []models.MenuItem{
		{ID: "menu_1", FoodStallID: "stall_1", Name: "Classic Burger", Description: "Burger", Price: 9.99, IsAvailable: true},
		{ID: "menu_2", FoodStallID: "stall_1", Name: "Fries", Description: "Fries", Price: 3.49, IsAvailable: true},
	}
	if err := db.Create(&menu).Error; err != nil {
		t.Fatalf("failed to seed menu: %v", err)
	}
}

