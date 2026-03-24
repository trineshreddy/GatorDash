package main

import (
	"fmt"
	"log"

	"gatordash-backend/database"
	"gatordash-backend/handlers"
	"gatordash-backend/routes"
	"gatordash-backend/store"
)

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize store
	userStore := store.NewUserStore()
	foodStore := store.NewFoodStore()

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userStore)
	foodHandler := handlers.NewFoodHandler(foodStore, userStore)

	// Setup routes
	router := routes.SetupRoutes(userHandler, foodHandler)

	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Println("API Endpoints:")
	fmt.Println("  POST   /api/signup")
	fmt.Println("  POST   /api/signin")
	fmt.Println("  GET    /api/users")
	fmt.Println("  GET    /api/foodstalls")
	fmt.Println("  GET    /api/foodstalls/:id/menu")
	fmt.Println("  POST   /api/cart/add")
	fmt.Println("  GET    /api/cart/:user_id")
	fmt.Println("  DELETE /api/cart/:user_id/item/:menu_item_id")
	fmt.Println("  DELETE /api/cart/:user_id/clear")

	log.Fatal(router.Run(port))
}
