package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPlaceOrder(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup user
	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Order User",
		"email":    "order@example.com",
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "order@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	signinResp := parseResponse(t, signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	token := signinData["token"].(string)

	// Add items to cart first
	add1Req, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	}))
	add1Req.Header.Set("Authorization", "Bearer "+token)
	add1Req.Header.Set("Content-Type", "application/json")
	add1W := httptest.NewRecorder()
	router.ServeHTTP(add1W, add1Req)

	add2Req, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_2",
		"quantity":     1,
	}))
	add2Req.Header.Set("Authorization", "Bearer "+token)
	add2Req.Header.Set("Content-Type", "application/json")
	add2W := httptest.NewRecorder()
	router.ServeHTTP(add2W, add2Req)

	// Now place the order
	orderReq, _ := http.NewRequest(http.MethodPost, "/api/order/place", createJSONBody(map[string]interface{}{
		"user_id": userID,
		"items": []map[string]interface{}{
			{
				"menu_item_id": "menu_1",
				"quantity":     2,
				"price":        8.99,
			},
			{
				"menu_item_id": "menu_2",
				"quantity":     1,
				"price":        12.99,
			},
		},
		"total": 30.97, // (8.99 * 2) + 12.99
	}))
	orderReq.Header.Set("Authorization", "Bearer "+token)
	orderReq.Header.Set("Content-Type", "application/json")
	orderW := httptest.NewRecorder()
	router.ServeHTTP(orderW, orderReq)

	if orderW.Code != http.StatusOK {
		t.Fatalf("place order expected 200, got %d", orderW.Code)
	}

	orderResp := parseResponse(t, orderW)
	var orderData map[string]interface{}
	if err := json.Unmarshal(orderResp.Data, &orderData); err != nil {
		t.Fatalf("failed to parse order response: %v", err)
	}

	// Verify order response contains expected fields
	if _, exists := orderData["order_id"]; !exists {
		t.Fatalf("expected order_id in response")
	}
	if _, exists := orderData["order_number"]; !exists {
		t.Fatalf("expected order_number in response")
	}
	if _, exists := orderData["status"]; !exists {
		t.Fatalf("expected status in response")
	}
	if _, exists := orderData["total_amount"]; !exists {
		t.Fatalf("expected total_amount in response")
	}
	if _, exists := orderData["estimated_time"]; !exists {
		t.Fatalf("expected estimated_time in response")
	}

	// Verify cart is cleared after order
	cartReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	cartReq.Header.Set("Authorization", "Bearer "+token)
	cartW := httptest.NewRecorder()
	router.ServeHTTP(cartW, cartReq)

	if cartW.Code != http.StatusOK {
		t.Fatalf("get cart after order expected 200, got %d", cartW.Code)
	}

	cartResp := parseResponse(t, cartW)
	var cartItems []interface{}
	if err := json.Unmarshal(cartResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart response: %v", err)
	}
	if len(cartItems) != 0 {
		t.Fatalf("expected empty cart after order, got %d items", len(cartItems))
	}
}

func TestGetOrderHistory(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "History User",
		"email":    "history@example.com",
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

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "history@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	signinResp := parseResponse(t, signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	token := signinData["token"].(string)

	addReq, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	}))
	addReq.Header.Set("Authorization", "Bearer "+token)
	addReq.Header.Set("Content-Type", "application/json")
	addW := httptest.NewRecorder()
	router.ServeHTTP(addW, addReq)
	if addW.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", addW.Code)
	}

	orderReq, _ := http.NewRequest(http.MethodPost, "/api/order/place", createJSONBody(map[string]interface{}{
		"user_id": userID,
		"items": []map[string]interface{}{
			{
				"menu_item_id": "menu_1",
				"quantity":     2,
				"price":        8.99,
			},
		},
		"total": 17.98,
	}))
	orderReq.Header.Set("Authorization", "Bearer "+token)
	orderReq.Header.Set("Content-Type", "application/json")
	orderW := httptest.NewRecorder()
	router.ServeHTTP(orderW, orderReq)
	if orderW.Code != http.StatusOK {
		t.Fatalf("place order expected 200, got %d", orderW.Code)
	}

	historyReq, _ := http.NewRequest(http.MethodGet, "/api/orders/"+userID, nil)
	historyReq.Header.Set("Authorization", "Bearer "+token)
	historyW := httptest.NewRecorder()
	router.ServeHTTP(historyW, historyReq)
	if historyW.Code != http.StatusOK {
		t.Fatalf("order history expected 200, got %d", historyW.Code)
	}

	historyResp := parseResponse(t, historyW)
	var orders []map[string]interface{}
	if err := json.Unmarshal(historyResp.Data, &orders); err != nil {
		t.Fatalf("failed to parse order history response: %v", err)
	}
	if len(orders) != 1 {
		t.Fatalf("expected 1 order in history, got %d", len(orders))
	}
	items, ok := orders[0]["items"].([]interface{})
	if !ok || len(items) != 1 {
		t.Fatalf("expected order history item count 1, got %v", orders[0]["items"])
	}
}

func TestReorderFromPastOrder(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup user
	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Reorder User",
		"email":    "reorder@example.com",
		"phone":    "9999999985",
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "reorder@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	signinResp := parseResponse(t, signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	token := signinData["token"].(string)

	// Add items to cart
	addReq, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	}))
	addReq.Header.Set("Authorization", "Bearer "+token)
	addReq.Header.Set("Content-Type", "application/json")
	addW := httptest.NewRecorder()
	router.ServeHTTP(addW, addReq)
	if addW.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", addW.Code)
	}

	// Place order
	orderReq, _ := http.NewRequest(http.MethodPost, "/api/order/place", createJSONBody(map[string]interface{}{
		"user_id": userID,
		"items": []map[string]interface{}{
			{
				"menu_item_id": "menu_1",
				"quantity":     2,
				"price":        8.99,
			},
		},
		"total": 17.98,
	}))
	orderReq.Header.Set("Authorization", "Bearer "+token)
	orderReq.Header.Set("Content-Type", "application/json")
	orderW := httptest.NewRecorder()
	router.ServeHTTP(orderW, orderReq)
	if orderW.Code != http.StatusOK {
		t.Fatalf("place order expected 200, got %d", orderW.Code)
	}

	orderResp := parseResponse(t, orderW)
	var orderData map[string]interface{}
	if err := json.Unmarshal(orderResp.Data, &orderData); err != nil {
		t.Fatalf("failed to parse order response: %v", err)
	}
	orderID := orderData["order_id"].(string)

	// Verify cart is cleared
	cartReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	cartReq.Header.Set("Authorization", "Bearer "+token)
	cartW := httptest.NewRecorder()
	router.ServeHTTP(cartW, cartReq)
	if cartW.Code != http.StatusOK {
		t.Fatalf("get cart expected 200, got %d", cartW.Code)
	}

	cartResp := parseResponse(t, cartW)
	var cartItems []interface{}
	if err := json.Unmarshal(cartResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart response: %v", err)
	}
	if len(cartItems) != 0 {
		t.Fatalf("expected empty cart before reorder, got %d items", len(cartItems))
	}

	// Test reorder - call POST /api/orders/{orderId}/reorder
	reorderReq, _ := http.NewRequest(http.MethodPost, "/api/orders/"+orderID+"/reorder", nil)
	reorderReq.Header.Set("Authorization", "Bearer "+token)
	reorderReq.Header.Set("Content-Type", "application/json")
	reorderW := httptest.NewRecorder()
	router.ServeHTTP(reorderW, reorderReq)

	if reorderW.Code != http.StatusOK {
		t.Fatalf("reorder expected 200, got %d", reorderW.Code)
	}

	reorderResp := parseResponse(t, reorderW)
	if !reorderResp.Success {
		t.Fatalf("expected successful reorder response")
	}

	// Verify cart now has items from the original order
	cartCheckReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	cartCheckReq.Header.Set("Authorization", "Bearer "+token)
	cartCheckW := httptest.NewRecorder()
	router.ServeHTTP(cartCheckW, cartCheckReq)

	if cartCheckW.Code != http.StatusOK {
		t.Fatalf("get cart after reorder expected 200, got %d", cartCheckW.Code)
	}

	cartCheckResp := parseResponse(t, cartCheckW)
	var cartItemsAfter []interface{}
	if err := json.Unmarshal(cartCheckResp.Data, &cartItemsAfter); err != nil {
		t.Fatalf("failed to parse cart response after reorder: %v", err)
	}
	if len(cartItemsAfter) != 1 {
		t.Fatalf("expected 1 item in cart after reorder, got %d", len(cartItemsAfter))
	}
}

func TestPlaceOrderWithEmptyCart(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup and signin
	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Empty Cart User",
		"email":    "emptycartorder@example.com",
		"phone":    "9999999984",
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

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "emptycartorder@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	signinResp := parseResponse(t, signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	token := signinData["token"].(string)

	// Try to place order with empty cart
	orderReq, _ := http.NewRequest(http.MethodPost, "/api/order/place", createJSONBody(map[string]interface{}{
		"user_id": userID,
		"items":   []map[string]interface{}{},
		"total":   0.00,
	}))
	orderReq.Header.Set("Authorization", "Bearer "+token)
	orderReq.Header.Set("Content-Type", "application/json")
	orderW := httptest.NewRecorder()
	router.ServeHTTP(orderW, orderReq)

	if orderW.Code != http.StatusBadRequest {
		t.Fatalf("place order with empty cart expected 400, got %d", orderW.Code)
	}

	resp := parseResponse(t, orderW)
	if resp.Success {
		t.Fatalf("expected failed response for empty cart order")
	}
}

func TestOrderHistoryUnauthorizedAccess(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Create first user and place order
	user1Signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "User One",
		"email":    "user1order@example.com",
		"phone":    "9999999983",
		"password": "password123",
	})
	if user1Signup.Code != http.StatusOK {
		t.Fatalf("user1 signup expected 200, got %d", user1Signup.Code)
	}

	signupResp := parseResponse(t, user1Signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	user1ID := signupData["id"].(string)

	// Create second user
	user2Signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "User Two",
		"email":    "user2order@example.com",
		"phone":    "9999999982",
		"password": "password123",
	})
	if user2Signup.Code != http.StatusOK {
		t.Fatalf("user2 signup expected 200, got %d", user2Signup.Code)
	}

	signupResp2 := parseResponse(t, user2Signup)
	var signupData2 map[string]interface{}
	if err := json.Unmarshal(signupResp2.Data, &signupData2); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}

	// Signin user 2 to get token
	user2Signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "user2order@example.com",
		"password": "password123",
	})
	if user2Signin.Code != http.StatusOK {
		t.Fatalf("user2 signin expected 200, got %d", user2Signin.Code)
	}

	signinResp := parseResponse(t, user2Signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	user2Token := signinData["token"].(string)

	// User 2 tries to access User 1's order history
	historyReq, _ := http.NewRequest(http.MethodGet, "/api/orders/"+user1ID, nil)
	historyReq.Header.Set("Authorization", "Bearer "+user2Token)
	historyW := httptest.NewRecorder()
	router.ServeHTTP(historyW, historyReq)

	if historyW.Code != http.StatusForbidden {
		t.Fatalf("unauthorized order history access expected 403, got %d", historyW.Code)
	}
}

func TestReorderNonExistentOrder(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup and signin
	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Reorder Test User",
		"email":    "reordertest@example.com",
		"phone":    "9999999981",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "reordertest@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	signinResp := parseResponse(t, signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(signinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	token := signinData["token"].(string)

	// Try to reorder with non-existent order ID
	reorderReq, _ := http.NewRequest(http.MethodPost, "/api/orders/nonexistent_order/reorder", nil)
	reorderReq.Header.Set("Authorization", "Bearer "+token)
	reorderReq.Header.Set("Content-Type", "application/json")
	reorderW := httptest.NewRecorder()
	router.ServeHTTP(reorderW, reorderReq)

	if reorderW.Code != http.StatusNotFound {
		t.Fatalf("reorder non-existent order expected 404, got %d", reorderW.Code)
	}
}

func TestReorderUnauthorizedAccess(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Create user 1 and place an order
	user1Signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "User One Reorder",
		"email":    "user1reorder@example.com",
		"phone":    "9999999980",
		"password": "password123",
	})
	if user1Signup.Code != http.StatusOK {
		t.Fatalf("user1 signup expected 200, got %d", user1Signup.Code)
	}

	signupResp := parseResponse(t, user1Signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("failed to parse signup response: %v", err)
	}
	user1ID := signupData["id"].(string)

	// User 1 signs in and places order
	user1Signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "user1reorder@example.com",
		"password": "password123",
	})
	if user1Signin.Code != http.StatusOK {
		t.Fatalf("user1 signin expected 200, got %d", user1Signin.Code)
	}

	singinResp := parseResponse(t, user1Signin)
	var signinData map[string]interface{}
	if err := json.Unmarshal(singinResp.Data, &signinData); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	user1Token := signinData["token"].(string)

	// Add item to cart and place order
	addReq, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      user1ID,
		"menu_item_id": "menu_1",
		"quantity":     1,
	}))
	addReq.Header.Set("Authorization", "Bearer "+user1Token)
	addReq.Header.Set("Content-Type", "application/json")
	addW := httptest.NewRecorder()
	router.ServeHTTP(addW, addReq)

	orderReq, _ := http.NewRequest(http.MethodPost, "/api/order/place", createJSONBody(map[string]interface{}{
		"user_id": user1ID,
		"items": []map[string]interface{}{
			{
				"menu_item_id": "menu_1",
				"quantity":     1,
				"price":        8.99,
			},
		},
		"total": 8.99,
	}))
	orderReq.Header.Set("Authorization", "Bearer "+user1Token)
	orderReq.Header.Set("Content-Type", "application/json")
	orderW := httptest.NewRecorder()
	router.ServeHTTP(orderW, orderReq)
	if orderW.Code != http.StatusOK {
		t.Fatalf("place order expected 200, got %d", orderW.Code)
	}

	orderResp := parseResponse(t, orderW)
	var orderData map[string]interface{}
	if err := json.Unmarshal(orderResp.Data, &orderData); err != nil {
		t.Fatalf("failed to parse order response: %v", err)
	}
	orderID := orderData["order_id"].(string)

	// Create user 2 and try to reorder user 1's order
	user2Signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "User Two Reorder",
		"email":    "user2reorder@example.com",
		"phone":    "9999999979",
		"password": "password123",
	})
	if user2Signup.Code != http.StatusOK {
		t.Fatalf("user2 signup expected 200, got %d", user2Signup.Code)
	}

	user2Signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "user2reorder@example.com",
		"password": "password123",
	})
	if user2Signin.Code != http.StatusOK {
		t.Fatalf("user2 signin expected 200, got %d", user2Signin.Code)
	}

	signinResp2 := parseResponse(t, user2Signin)
	var signinData2 map[string]interface{}
	if err := json.Unmarshal(signinResp2.Data, &signinData2); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}
	user2Token := signinData2["token"].(string)

	// User 2 tries to reorder user 1's order
	reorderReq, _ := http.NewRequest(http.MethodPost, "/api/orders/"+orderID+"/reorder", nil)
	reorderReq.Header.Set("Authorization", "Bearer "+user2Token)
	reorderReq.Header.Set("Content-Type", "application/json")
	reorderW := httptest.NewRecorder()
	router.ServeHTTP(reorderW, reorderReq)

	if reorderW.Code != http.StatusForbidden {
		t.Fatalf("unauthorized reorder expected 403, got %d", reorderW.Code)
	}
}

