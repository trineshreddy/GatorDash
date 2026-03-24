package tests

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestCartLifecycle(t *testing.T) {
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

	remove := performRequest(router, http.MethodDelete, "/api/cart/"+userID+"/item/menu_1", nil)
	if remove.Code != http.StatusOK {
		t.Fatalf("remove cart item expected 200, got %d", remove.Code)
	}

	addAgain := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_2",
		"quantity":     1,
	})
	if addAgain.Code != http.StatusOK {
		t.Fatalf("add second item expected 200, got %d", addAgain.Code)
	}

	clear := performRequest(router, http.MethodDelete, "/api/cart/"+userID+"/clear", nil)
	if clear.Code != http.StatusOK {
		t.Fatalf("clear cart expected 200, got %d", clear.Code)
	}

	viewAfterClear := performRequest(router, http.MethodGet, "/api/cart/"+userID, nil)
	if viewAfterClear.Code != http.StatusOK {
		t.Fatalf("view after clear expected 200, got %d", viewAfterClear.Code)
	}
	clearResp := parseResponse(t, viewAfterClear)
	var remaining []map[string]interface{}
	if err := json.Unmarshal(clearResp.Data, &remaining); err != nil {
		t.Fatalf("failed to parse cart items after clear: %v", err)
	}
	if len(remaining) != 0 {
		t.Fatalf("expected empty cart, got %d items", len(remaining))
	}
}

func TestAddToCartValidation(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	w := performRequest(router, http.MethodPost, "/api/cart/add", map[string]interface{}{
		"user_id":      "missing_user",
		"menu_item_id": "menu_1",
		"quantity":     0,
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid quantity, got %d", w.Code)
	}
}

