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
		// Public routes (no auth required)
		api.POST("/signup", userHandler.SignUp)
		api.POST("/signin", userHandler.SignIn)
		api.POST("/forgot-password", userHandler.ForgotPassword)
		api.POST("/reset-password", userHandler.ResetPassword)

		// Food stalls and menu (public)
		api.GET("/foodstalls", foodHandler.GetAllFoodStalls)
		api.GET("/foodstalls/:id/menu", foodHandler.GetFoodStallMenu)
		api.GET("/menu-items/by-name", foodHandler.GetMenuItemsByName)
		api.GET("/menu-items", foodHandler.GetAllMenuItems)

		// Protected routes (require JWT auth)
		protected := api.Group("")
		protected.Use(utils.JWTAuthMiddleware())
		{
			// User management
			protected.GET("/users", userHandler.GetAllUsers)
			protected.GET("/user/:id", userHandler.GetUser)
			protected.PUT("/user/:id", userHandler.UpdateUser)
			protected.DELETE("/user/:id", userHandler.DeleteUser)

			// Cart operations
			protected.POST("/cart/add", foodHandler.AddToCart)
			protected.GET("/cart/:user_id", foodHandler.GetCartItems)
			protected.PUT("/cart/:user_id/item/:menu_item_id", foodHandler.UpdateCartItemQuantity)
			protected.DELETE("/cart/:user_id/item/:menu_item_id", foodHandler.RemoveCartItem)
			protected.DELETE("/cart/:user_id/clear", foodHandler.ClearCart)

			// Payment processing
			protected.POST("/payment/process", foodHandler.ProcessPayment)

			// Order operations
			protected.POST("/order/place", foodHandler.PlaceOrder)
			protected.GET("/orders/:user_id", foodHandler.GetOrderHistory)
		}
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		utils.SendSuccess(c, "Server is running", nil)
	})

	return r
}
