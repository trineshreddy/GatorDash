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