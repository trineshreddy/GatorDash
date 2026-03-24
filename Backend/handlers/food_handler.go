package handlers

import (
	"gatordash-backend/models"
	"gatordash-backend/store"
	"gatordash-backend/utils"

	"github.com/gin-gonic/gin"
)

// FoodHandler handles food stall, menu, and cart APIs.
type FoodHandler struct {
	foodStore *store.FoodStore
	userStore *store.UserStore
}

// NewFoodHandler creates a new FoodHandler.
func NewFoodHandler(foodStore *store.FoodStore, userStore *store.UserStore) *FoodHandler {
	return &FoodHandler{
		foodStore: foodStore,
		userStore: userStore,
	}
}

// GetAllFoodStalls fetches all food stalls.
func (h *FoodHandler) GetAllFoodStalls(c *gin.Context) {
	stalls, err := h.foodStore.GetAllFoodStalls()
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}
	utils.SendSuccess(c, "Food stalls retrieved successfully", stalls)
}

// GetFoodStallMenu fetches menu for a specific food stall.
func (h *FoodHandler) GetFoodStallMenu(c *gin.Context) {
	foodStallID := c.Param("id")
	if foodStallID == "" {
		utils.SendError(c, 400, "Food stall ID is required")
		return
	}

	if _, exists := h.foodStore.GetFoodStallByID(foodStallID); !exists {
		utils.SendError(c, 404, "Food stall not found")
		return
	}

	items, err := h.foodStore.GetMenuByFoodStallID(foodStallID)
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Menu retrieved successfully", items)
}

// AddToCart adds items to user cart.
func (h *FoodHandler) AddToCart(c *gin.Context) {
	var req models.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}

	if req.UserID == "" || req.MenuItemID == "" {
		utils.SendError(c, 400, "user_id and menu_item_id are required")
		return
	}
	if req.Quantity <= 0 {
		utils.SendError(c, 400, "quantity must be greater than 0")
		return
	}

	if _, exists := h.userStore.GetUserByID(req.UserID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}
	if _, exists := h.foodStore.GetMenuItemByID(req.MenuItemID); !exists {
		utils.SendError(c, 404, "Menu item not found")
		return
	}

	if err := h.foodStore.AddToCart(req.UserID, req.MenuItemID, req.Quantity); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Item added to cart successfully", nil)
}

// GetCartItems gets all items from user cart.
func (h *FoodHandler) GetCartItems(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		utils.SendError(c, 400, "User ID is required")
		return
	}

	if _, exists := h.userStore.GetUserByID(userID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	cartItems, err := h.foodStore.GetCartItems(userID)
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Cart items retrieved successfully", cartItems)
}

// RemoveCartItem removes a specific item from a user cart.
func (h *FoodHandler) RemoveCartItem(c *gin.Context) {
	userID := c.Param("user_id")
	menuItemID := c.Param("menu_item_id")

	if userID == "" || menuItemID == "" {
		utils.SendError(c, 400, "User ID and menu item ID are required")
		return
	}

	if _, exists := h.userStore.GetUserByID(userID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	if err := h.foodStore.RemoveCartItem(userID, menuItemID); err != nil {
		utils.SendError(c, 404, err.Error())
		return
	}

	utils.SendSuccess(c, "Cart item removed successfully", nil)
}

// ClearCart removes all items from a user cart.
func (h *FoodHandler) ClearCart(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		utils.SendError(c, 400, "User ID is required")
		return
	}

	if _, exists := h.userStore.GetUserByID(userID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	if err := h.foodStore.ClearCart(userID); err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Cart cleared successfully", nil)
}
