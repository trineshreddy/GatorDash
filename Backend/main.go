package main

import (
	"fmt"
	"log"

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

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userStore)

	// Setup routes
	router := routes.SetupRoutes(userHandler)

	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Println("API Endpoints:")
	fmt.Println("  POST   /api/signup")
	fmt.Println("  POST   /api/signin")
	fmt.Println("  GET    /api/users")

	log.Fatal(router.Run(port))
}