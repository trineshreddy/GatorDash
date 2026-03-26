package tests

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
)

func signupUserAndGetID(t *testing.T, router *gin.Engine, email string) string {
	t.Helper()

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "John Doe",
		"email":    email,
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
	return userID
}

func TestSignup(t *testing.T) {
	router, _ := setupTestRouter(t)

	w := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "John Doe",
		"email":    "signup@example.com",
		"phone":    "1234567890",
		"password": "password123",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success=true")
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Data, &data); err != nil {
		t.Fatalf("failed to parse signup data: %v", err)
	}
	if _, ok := data["id"].(string); !ok {
		t.Fatalf("expected id in response data")
	}
}

func TestSignin(t *testing.T) {
	router, _ := setupTestRouter(t)

	email := "signin@example.com"
	_ = signupUserAndGetID(t, router, email)

	w := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    email,
		"password": "password123",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success=true")
	}
}

func TestFetchUser(t *testing.T) {
	router, _ := setupTestRouter(t)

	email := "fetch@example.com"
	userID := signupUserAndGetID(t, router, email)

	w := performRequest(router, http.MethodGet, "/api/user/"+userID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("get user expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success=true")
	}
	var data map[string]interface{}
	if err := json.Unmarshal(resp.Data, &data); err != nil {
		t.Fatalf("failed to parse get user data: %v", err)
	}
	if data["id"] != userID {
		t.Fatalf("expected id %s, got %v", userID, data["id"])
	}
}

func TestEditUser(t *testing.T) {
	router, _ := setupTestRouter(t)

	email := "edit@example.com"
	userID := signupUserAndGetID(t, router, email)

	update := performRequest(router, http.MethodPut, "/api/user/"+userID, map[string]interface{}{
		"name":  "Jane Doe",
		"phone": "9876543210",
	})
	if update.Code != http.StatusOK {
		t.Fatalf("update user expected 200, got %d", update.Code)
	}

	updated := performRequest(router, http.MethodGet, "/api/user/"+userID, nil)
	if updated.Code != http.StatusOK {
		t.Fatalf("get after update expected 200, got %d", updated.Code)
	}
	updatedResp := parseResponse(t, updated)
	if !updatedResp.Success {
		t.Fatalf("expected success=true")
	}

	var data map[string]interface{}
	if err := json.Unmarshal(updatedResp.Data, &data); err != nil {
		t.Fatalf("failed to parse updated user data: %v", err)
	}
	if data["name"] != "Jane Doe" {
		t.Fatalf("expected name 'Jane Doe', got %v", data["name"])
	}
	if data["phone"] != "9876543210" {
		t.Fatalf("expected phone '9876543210', got %v", data["phone"])
	}
}

func TestDeleteUser(t *testing.T) {
	router, _ := setupTestRouter(t)

	email := "delete@example.com"
	userID := signupUserAndGetID(t, router, email)

	del := performRequest(router, http.MethodDelete, "/api/user/"+userID, nil)
	if del.Code != http.StatusOK {
		t.Fatalf("delete user expected 200, got %d", del.Code)
	}

	// Confirm deleted
	get := performRequest(router, http.MethodGet, "/api/user/"+userID, nil)
	if get.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete, got %d", get.Code)
	}
}
