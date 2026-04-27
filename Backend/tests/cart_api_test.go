package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Helper function to create JSON request body
func createJSONBody(data map[string]interface{}) *bytes.Buffer {
	jsonData, _ := json.Marshal(data)
	return bytes.NewBuffer(jsonData)
}

func TestAddItemsToCart(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup user
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "cart@example.com",
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

	// Add to cart with JWT token
	req, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     2,
	}))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", w.Code)
	}

	// View cart with JWT token
	viewReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	viewReq.Header.Set("Authorization", "Bearer "+token)
	viewW := httptest.NewRecorder()
	router.ServeHTTP(viewW, viewReq)

	if viewW.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", viewW.Code)
	}
	viewResp := parseResponse(t, viewW)
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

	// Signup user
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "fetchcart@example.com",
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

	// Add two items with JWT
	add1Req, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     1,
	}))
	add1Req.Header.Set("Authorization", "Bearer "+token)
	add1Req.Header.Set("Content-Type", "application/json")
	add1W := httptest.NewRecorder()
	router.ServeHTTP(add1W, add1Req)

	add2Req, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_2",
		"quantity":     3,
	}))
	add2Req.Header.Set("Authorization", "Bearer "+token)
	add2Req.Header.Set("Content-Type", "application/json")
	add2W := httptest.NewRecorder()
	router.ServeHTTP(add2W, add2Req)

	if add2W.Code != http.StatusOK {
		t.Fatalf("add second item expected 200, got %d", add2W.Code)
	}

	// View cart with JWT
	viewReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	viewReq.Header.Set("Authorization", "Bearer "+token)
	viewW := httptest.NewRecorder()
	router.ServeHTTP(viewW, viewReq)

	if viewW.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", viewW.Code)
	}
	viewResp := parseResponse(t, viewW)
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "deletesp@example.com",
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

	// Add one item with JWT
	addReq, _ := http.NewRequest(http.MethodPost, "/api/cart/add", createJSONBody(map[string]interface{}{
		"user_id":      userID,
		"menu_item_id": "menu_1",
		"quantity":     1,
	}))
	addReq.Header.Set("Authorization", "Bearer "+token)
	addReq.Header.Set("Content-Type", "application/json")
	addW := httptest.NewRecorder()
	router.ServeHTTP(addW, addReq)
	if addW.Code != http.StatusOK {
		t.Fatalf("add to cart expected 200, got %d", addW.Code)
	}

	// Delete item with JWT
	removeReq, _ := http.NewRequest(http.MethodDelete, "/api/cart/"+userID+"/item/menu_1", nil)
	removeReq.Header.Set("Authorization", "Bearer "+token)
	removeW := httptest.NewRecorder()
	router.ServeHTTP(removeW, removeReq)
	if removeW.Code != http.StatusOK {
		t.Fatalf("remove cart item expected 200, got %d", removeW.Code)
	}

	// View cart with JWT
	viewReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	viewReq.Header.Set("Authorization", "Bearer "+token)
	viewW := httptest.NewRecorder()
	router.ServeHTTP(viewW, viewReq)
	if viewW.Code != http.StatusOK {
		t.Fatalf("view cart expected 200, got %d", viewW.Code)
	}
	viewResp := parseResponse(t, viewW)
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "emptycart@example.com",
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

	// Add items with JWT
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

	// Clear cart with JWT
	clearReq, _ := http.NewRequest(http.MethodDelete, "/api/cart/"+userID+"/clear", nil)
	clearReq.Header.Set("Authorization", "Bearer "+token)
	clearW := httptest.NewRecorder()
	router.ServeHTTP(clearW, clearReq)
	if clearW.Code != http.StatusOK {
		t.Fatalf("clear cart expected 200, got %d", clearW.Code)
	}

	// View cart with JWT
	viewReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	viewReq.Header.Set("Authorization", "Bearer "+token)
	viewW := httptest.NewRecorder()
	router.ServeHTTP(viewW, viewReq)
	if viewW.Code != http.StatusOK {
		t.Fatalf("view after clear expected 200, got %d", viewW.Code)
	}
	viewResp := parseResponse(t, viewW)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 0 {
		t.Fatalf("expected empty cart, got %d items", len(cartItems))
	}
}

func TestUpdateCartItemQuantity(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Qty User",
		"email":    "qtycart@example.com",
		"phone":    "9999999995",
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "qtycart@example.com",
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

	// Update quantity with JWT
	putReq, _ := http.NewRequest(http.MethodPut, "/api/cart/"+userID+"/item/menu_1", createJSONBody(map[string]interface{}{
		"quantity": 5,
	}))
	putReq.Header.Set("Authorization", "Bearer "+token)
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	router.ServeHTTP(putW, putReq)
	if putW.Code != http.StatusOK {
		t.Fatalf("update cart quantity expected 200, got %d", putW.Code)
	}

	// View cart with JWT
	viewReq, _ := http.NewRequest(http.MethodGet, "/api/cart/"+userID, nil)
	viewReq.Header.Set("Authorization", "Bearer "+token)
	viewW := httptest.NewRecorder()
	router.ServeHTTP(viewW, viewReq)
	viewResp := parseResponse(t, viewW)
	var cartItems []map[string]interface{}
	if err := json.Unmarshal(viewResp.Data, &cartItems); err != nil {
		t.Fatalf("failed to parse cart items: %v", err)
	}
	if len(cartItems) != 1 {
		t.Fatalf("expected 1 cart item, got %d", len(cartItems))
	}
	qty, ok := cartItems[0]["quantity"].(float64)
	if !ok || int(qty) != 5 {
		t.Fatalf("expected quantity 5, got %v", cartItems[0]["quantity"])
	}
}
