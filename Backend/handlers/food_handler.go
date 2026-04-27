package handlers

import (
	"errors"
	"fmt"
	"time"

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

// GetAllMenuItems returns all menu items from every stall.
func (h *FoodHandler) GetAllMenuItems(c *gin.Context) {
	items, err := h.foodStore.GetAllMenuItems()
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}
	utils.SendSuccess(c, "Menu items retrieved successfully", items)
}

// GetMenuItemsByName returns menu items matching the name query (case-insensitive exact match).
func (h *FoodHandler) GetMenuItemsByName(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		utils.SendError(c, 400, "Query parameter name is required")
		return
	}

	items, err := h.foodStore.GetMenuItemsByName(name)
	if err != nil {
		utils.SendError(c, 500, err.Error())
		return
	}
	if len(items) == 0 {
		utils.SendError(c, 404, "No menu items found with that name")
		return
	}

	utils.SendSuccess(c, "Menu items retrieved successfully", items)
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

// UpdateCartItemQuantity sets quantity for a cart line.
func (h *FoodHandler) UpdateCartItemQuantity(c *gin.Context) {
	userID := c.Param("user_id")
	menuItemID := c.Param("menu_item_id")
	if userID == "" || menuItemID == "" {
		utils.SendError(c, 400, "User ID and menu item ID are required")
		return
	}

	var req models.UpdateCartQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}
	if req.Quantity <= 0 {
		utils.SendError(c, 400, "quantity must be greater than 0")
		return
	}

	if _, exists := h.userStore.GetUserByID(userID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	if err := h.foodStore.UpdateCartItemQuantity(userID, menuItemID, req.Quantity); err != nil {
		if errors.Is(err, store.ErrCartItemNotFound) {
			utils.SendError(c, 404, err.Error())
			return
		}
		utils.SendError(c, 500, err.Error())
		return
	}

	utils.SendSuccess(c, "Cart quantity updated successfully", nil)
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

// PlaceOrder creates a new order from the user's cart
func (h *FoodHandler) PlaceOrder(c *gin.Context) {
	var req models.OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, 400, "Invalid request body")
		return
	}

	// Validate user exists
	if _, exists := h.userStore.GetUserByID(req.UserID); !exists {
		utils.SendError(c, 404, "User not found")
		return
	}

	// Get cart items to validate and create order items
	cartItems, err := h.foodStore.GetCartItems(req.UserID)
	if err != nil {
		utils.SendError(c, 500, "Failed to retrieve cart items")
		return
	}

	if len(cartItems) == 0 {
		utils.SendError(c, 400, "Cart is empty")
		return
	}

	// Validate that request items match cart items
	if len(req.Items) != len(cartItems) {
		utils.SendError(c, 400, "Order items do not match cart contents")
		return
	}

	// Create order
	order := models.Order{
		UserID:      req.UserID,
		OrderNumber: generateOrderNumber(),
		Status:      "ordered",
		TotalAmount: req.Total,
		TaxAmount:   req.Total * 0.07, // 7% tax
	}

	// Create order items from cart items
	var orderItems []models.OrderItem
	for _, cartItem := range cartItems {
		// Get menu item details for the order item
		menuItem, exists := h.foodStore.GetMenuItemByID(cartItem.MenuItemID)
		if !exists {
			utils.SendError(c, 500, "Failed to retrieve menu item details")
			return
		}

		orderItems = append(orderItems, models.OrderItem{
			MenuItemID:  cartItem.MenuItemID,
			Name:        cartItem.ItemName,
			Description: menuItem.Description,
			Price:       cartItem.Price,
			Quantity:    cartItem.Quantity,
		})
	}

	// Save order and order items to database
	if err := h.foodStore.CreateOrder(&order, orderItems); err != nil {
		utils.SendError(c, 500, "Failed to create order")
		return
	}

	// Clear the user's cart after successful order
	if err := h.foodStore.ClearCart(req.UserID); err != nil {
		// Log error but don't fail the order since it's already created
		// In production, you might want to handle this differently
	}

	// Calculate estimated delivery time (15-20 minutes from now)
	estimatedTime := "15-20 minutes"

	response := models.OrderResponse{
		OrderID:       order.ID,
		OrderNumber:   order.OrderNumber,
		Status:        order.Status,
		TotalAmount:   order.TotalAmount,
		EstimatedTime: estimatedTime,
		CreatedAt:     order.CreatedAt,
	}

	utils.SendSuccess(c, "Order placed successfully", response)
}

// generateOrderNumber creates a unique order number
func generateOrderNumber() string {
	// Generate a simple order number using timestamp
	// In production, you might want a more sophisticated approach
	timestamp := time.Now().Unix()
	random := timestamp % 1000
	return fmt.Sprintf("GD-%d-%03d", timestamp, random)
}
