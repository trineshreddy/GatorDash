package models

import "time"

// FoodStall represents a food stall/restaurant.
type FoodStall struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (FoodStall) TableName() string {
	return "foodstalls"
}

// MenuItem represents a menu item that belongs to a food stall.
type MenuItem struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	FoodStallID string    `gorm:"not null;index" json:"food_stall_id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Price       float64   `gorm:"not null" json:"price"`
	IsAvailable bool      `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (MenuItem) TableName() string {
	return "menu"
}

// CartItem represents an item added to a user's cart.
type CartItem struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	UserID     string    `gorm:"not null;index" json:"user_id"`
	MenuItemID string    `gorm:"not null;index" json:"menu_item_id"`
	Quantity   int       `gorm:"not null" json:"quantity"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (CartItem) TableName() string {
	return "cart"
}

// AddToCartRequest is used to add items to a cart.
type AddToCartRequest struct {
	UserID     string `json:"user_id"`
	MenuItemID string `json:"menu_item_id"`
	Quantity   int    `json:"quantity"`
}

// CartItemResponse is returned when viewing cart details.
type CartItemResponse struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	MenuItemID string  `json:"menu_item_id"`
	ItemName   string  `json:"item_name"`
	Price      float64 `json:"price"`
	Quantity   int     `json:"quantity"`
	Subtotal   float64 `json:"subtotal"`
}
