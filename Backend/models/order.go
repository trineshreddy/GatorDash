package models

import (
	"time"
)

// Order represents an order placed by a user
type Order struct {
	ID              string    `json:"id" gorm:"primaryKey"`
	UserID          string    `json:"user_id" gorm:"not null"`
	OrderNumber     string    `json:"order_number" gorm:"uniqueIndex;not null"`
	Status          string    `json:"status" gorm:"not null;default:'ordered'"` // ordered, preparing, ready, delivered
	TotalAmount     float64   `json:"total_amount" gorm:"not null"`
	TaxAmount       float64   `json:"tax_amount" gorm:"not null"`
	DeliveryTime    *time.Time `json:"delivery_time,omitempty"`
	Items           []OrderItem `json:"items,omitempty" gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID          string  `json:"id" gorm:"primaryKey"`
	OrderID     string  `json:"order_id" gorm:"not null"`
	MenuItemID  string  `json:"menu_item_id" gorm:"not null"`
	Name        string  `json:"name" gorm:"not null"`
	Description string  `json:"description"`
	Price       float64 `json:"price" gorm:"not null"`
	Quantity    int     `json:"quantity" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Order     Order     `json:"-" gorm:"foreignKey:OrderID"`
	MenuItem  MenuItem  `json:"-" gorm:"foreignKey:MenuItemID"`
}

// OrderRequest represents the request body for placing an order
type OrderRequest struct {
	UserID string                   `json:"user_id" binding:"required"`
	Items  []OrderItemRequest      `json:"items" binding:"required,min=1"`
	Total  float64                  `json:"total" binding:"required,min=0"`
}

// OrderItemRequest represents an item in the order request
type OrderItemRequest struct {
	MenuItemID string  `json:"menu_item_id" binding:"required"`
	Quantity   int     `json:"quantity" binding:"required,min=1"`
	Price      float64 `json:"price" binding:"required,min=0"`
}

// OrderResponse represents the response for a placed order
type OrderResponse struct {
	OrderID      string    `json:"order_id"`
	OrderNumber  string    `json:"order_number"`
	Status       string    `json:"status"`
	TotalAmount  float64   `json:"total_amount"`
	EstimatedTime string   `json:"estimated_time"` // e.g., "15-20 minutes"
	CreatedAt    time.Time `json:"created_at"`
}

type OrderHistoryItem struct {
	MenuItemID  string  `json:"menu_item_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
}

type OrderHistoryResponse struct {
	OrderID      string             `json:"order_id"`
	OrderNumber  string             `json:"order_number"`
	Status       string             `json:"status"`
	TotalAmount  float64            `json:"total_amount"`
	TaxAmount    float64            `json:"tax_amount"`
	EstimatedTime string            `json:"estimated_time"`
	CreatedAt    time.Time          `json:"created_at"`
	Items        []OrderHistoryItem `json:"items"`
}
