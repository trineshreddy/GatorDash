package routes

import (
	"gatordash-backend/handlers"
	"gatordash-backend/utils"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(userHandler *handlers.UserHandler, foodHandler *handlers.FoodHandler) *gin.Engine {
	r := gin.Default()

	// API routes
	api := r.Group("/api")
	{
		api.POST("/signup", userHandler.SignUp)
		api.POST("/signin", userHandler.SignIn)
		api.GET("/users", userHandler.GetAllUsers)
		api.GET("/user/:id", userHandler.GetUser)
		api.PUT("/user/:id", userHandler.UpdateUser)
		api.DELETE("/user/:id", userHandler.DeleteUser)

		// Food stalls and menu
		api.GET("/foodstalls", foodHandler.GetAllFoodStalls)
		api.GET("/foodstalls/:id/menu", foodHandler.GetFoodStallMenu)

		// Cart
		api.POST("/cart/add", foodHandler.AddToCart)
		api.GET("/cart/:user_id", foodHandler.GetCartItems)
		api.DELETE("/cart/:user_id/item/:menu_item_id", foodHandler.RemoveCartItem)
		api.DELETE("/cart/:user_id/clear", foodHandler.ClearCart)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		utils.SendSuccess(c, "Server is running", nil)
	})

	return r
}
