package tests

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestHealthCheck(t *testing.T) {
	router, _ := setupTestRouter(t)

	w := performRequest(router, http.MethodGet, "/health", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success true")
	}
}

func TestUserLifecycle(t *testing.T) {
	router, _ := setupTestRouter(t)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "John Doe",
		"email":    "john@example.com",
		"phone":    "1234567890",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signupResp := parseResponse(t, signup)
	var signupData map[string]interface{}
	if err := json.Unmarshal(signupResp.Data, &signupData); err != nil {
		t.Fatalf("unable to parse signup data: %v", err)
	}
	userID, ok := signupData["id"].(string)
	if !ok || userID == "" {
		t.Fatalf("user id missing in signup response")
	}

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "john@example.com",
		"password": "password123",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signin.Code)
	}

	getUser := performRequest(router, http.MethodGet, "/api/user/"+userID, nil)
	if getUser.Code != http.StatusOK {
		t.Fatalf("get user expected 200, got %d", getUser.Code)
	}

	update := performRequest(router, http.MethodPut, "/api/user/"+userID, map[string]interface{}{
		"name":  "Jane Doe",
		"phone": "9876543210",
	})
	if update.Code != http.StatusOK {
		t.Fatalf("update user expected 200, got %d", update.Code)
	}

	deleteResp := performRequest(router, http.MethodDelete, "/api/user/"+userID, nil)
	if deleteResp.Code != http.StatusOK {
		t.Fatalf("delete user expected 200, got %d", deleteResp.Code)
	}
}

