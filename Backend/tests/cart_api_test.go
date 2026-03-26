package tests

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestAddItemsToCart(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Cart User",
		"email":    "cart@example.com",
		"phone":    "9999999999",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signupResp := parseResponse(t, signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	userID := signupData["id"].(string)

	add := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	})
	if add.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", add.Code)
	}

	// Minimal verification: cart contains the added item.
	view := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
	if view.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", view.Code)
	}
	viewResp := parseResponse(t, view)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 1 {
		t.Fatalf("expected 1 cart item, got %d", len(cartItems))
	}
}

func TestFetchCartItems(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Cart Fetch User",
		"email":    "fetchcart@example.com",
		"phone":    "9999999998",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signupResp := parseResponse(t, signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	userID := signupData["id"].(string)

	// Add two items
	_ = performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     1,
	})
	add2 := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_2",
		"quantity":     3,
	})
	if add2.Code != http.StatusOK {
		t.Fatalf("add second item expected 200, got %d", add2.Code)
	}

	view := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
	if view.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", view.Code)
	}
	viewResp := parseResponse(t, view)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 2 {
		t.Fatalf("expected 2 cart items, got %d", len(cartItems))
	}
}

func TestDeleteItemFromCart(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Cart Delete User",
		"email":    "deletesp@example.com",
		"phone":    "9999999997",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signupResp := parseResponse(t, signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	userID := signupData["id"].(string)

	// Add one item, then delete it
	add := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     1,
	})
	if add.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", add.Code)
	}

	remove := performRequest(router, http.MethodDelete, "/api/cart/"+userID+"/item/menu_1", nil)
	if remove.Code != http.StatusOK {
		t.Fatalf("remove cart item expected 200, got %d", remove.Code)
	}

	view := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
	if view.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", view.Code)
	}
	viewResp := parseResponse(t, view)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 0 {
		t.Fatalf("expected empty cart after delete, got %d items", len(cartItems))
	}
}

func TestEmptyCart(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Cart Empty User",
		"email":    "emptycart@example.com",
		"phone":    "9999999996",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signupResp := parseResponse(t, signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	userID := signupData["id"].(string)

	// Add items, then clear
	add := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	})
	if add.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", add.Code)
	}

	clear := performRequest(router, http.MethodDelete, "/api/cart/"+userID+"/clear", nil)
	if clear.Code != http.StatusOK {
		t.Fatalf("clear cart expected 200, got %d", clear.Code)
	}

	view := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
	if view.Code != http.StatusOK {
		t.Fatalf("view after clear expected 200, got %d", view.Code)
	}
	viewResp := parseResponse(t, view)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 0 {
		t.Fatalf("expected empty cart, got %d items", len(cartItems))
	}
}
