package store

import (
	"fmt"
	"time"

	"gatordash-backend/database"
	"gatordash-backend/models"

	"gorm.io/gorm"
)

// FoodStore handles food stalls, menu, and cart operations.
type FoodStore struct {
	db *gorm.DB
}

// NewFoodStore creates a new FoodStore.
func NewFoodStore() *FoodStore {
	return &FoodStore{
		db: database.GetDB(),
	}
}

// GetAllFoodStalls fetches all food stalls.
func (s *FoodStore) GetAllFoodStalls() ([]models.FoodStall, error) {
	var stalls []models.FoodStall
	if err := s.db.Order("name ASC").Find(&stalls).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch food stalls: %w", err)
	}
	return stalls, nil
}

// GetFoodStallByID fetches a food stall by id.
func (s *FoodStore) GetFoodStallByID(foodStallID string) (*models.FoodStall, bool) {
	var stall models.FoodStall
	if err := s.db.First(&stall, "id = ?", foodStallID).Error; err != nil {
		return nil, false
	}
	return &stall, true
}

// GetMenuByFoodStallID fetches menu items for a stall.
func (s *FoodStore) GetMenuByFoodStallID(foodStallID string) ([]models.MenuItem, error) {
	var items []models.MenuItem
	if err := s.db.Where("food_stall_id = ?", foodStallID).Order("name ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch menu: %w", err)
	}
	return items, nil
}

// GetMenuItemByID fetches a menu item by id.
func (s *FoodStore) GetMenuItemByID(menuItemID string) (*models.MenuItem, bool) {
	var item models.MenuItem
	if err := s.db.First(&item, "id = ?", menuItemID).Error; err != nil {
		return nil, false
	}
	return &item, true
}

// AddToCart creates a cart item or increments quantity if it exists.
func (s *FoodStore) AddToCart(userID, menuItemID string, quantity int) error {
	var cartItem models.CartItem
	err := s.db.Where("user_id = ? AND menu_item_id = ?", userID, menuItemID).First(&cartItem).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			newItem := models.CartItem{
				ID:         fmt.Sprintf("cart_%d", time.Now().UnixNano()),
				UserID:     userID,
				MenuItemID: menuItemID,
				Quantity:   quantity,
			}
			if createErr := s.db.Create(&newItem).Error; createErr != nil {
				return fmt.Errorf("failed to add item to cart: %w", createErr)
			}
			return nil
		}
		return fmt.Errorf("failed to check cart item: %w", err)
	}

	cartItem.Quantity += quantity
	cartItem.UpdatedAt = time.Now()
	if err := s.db.Save(&cartItem).Error; err != nil {
		return fmt.Errorf("failed to update cart item: %w", err)
	}
	return nil
}

// GetCartItems fetches cart items for a user with menu details.
func (s *FoodStore) GetCartItems(userID string) ([]models.CartItemResponse, error) {
	var cartItems []models.CartItem
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&cartItems).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch cart items: %w", err)
	}

	response := make([]models.CartItemResponse, 0, len(cartItems))
	for _, item := range cartItems {
		var menuItem models.MenuItem
		if err := s.db.First(&menuItem, "id = ?", item.MenuItemID).Error; err != nil {
			return nil, fmt.Errorf("failed to fetch menu item for cart: %w", err)
		}

		response = append(response, models.CartItemResponse{
			ID:         item.ID,
			UserID:     item.UserID,
			MenuItemID: item.MenuItemID,
			ItemName:   menuItem.Name,
			Price:      menuItem.Price,
			Quantity:   item.Quantity,
			Subtotal:   menuItem.Price * float64(item.Quantity),
		})
	}

	return response, nil
}

// RemoveCartItem removes a specific item from a user's cart.
func (s *FoodStore) RemoveCartItem(userID, menuItemID string) error {
	result := s.db.Where("user_id = ? AND menu_item_id = ?", userID, menuItemID).Delete(&models.CartItem{})
	if result.Error != nil {
		return fmt.Errorf("failed to remove item from cart: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("cart item not found")
	}
	return nil
}

// ClearCart removes all items from a user's cart.
func (s *FoodStore) ClearCart(userID string) error {
	if err := s.db.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}
	return nil
}
