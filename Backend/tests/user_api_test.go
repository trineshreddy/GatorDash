package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
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

	// Check that response contains user and token
	var data map[string]interface{}
	if err := json.Unmarshal(resp.Data, &data); err != nil {
		t.Fatalf("failed to parse response data: %v", err)
	}

	if _, exists := data["user"]; !exists {
		t.Fatalf("expected user in response data")
	}

	if _, exists := data["token"]; !exists {
		t.Fatalf("expected token in response data")
	}
}

func TestFetchUser(t *testing.T) {
	router, _ := setupTestRouter(t)

	email := "fetch@example.com"
	userID := signupUserAndGetID(t, router, email)

	// Sign in to get JWT token
	signinResp := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    email,
		"password": "password123",
	})
	if signinResp.Code != http.StatusOK {
		t.Fatalf("signin expected 200, got %d", signinResp.Code)
	}

	signinData := parseResponse(t, signinResp)
	var signinResult map[string]interface{}
	if err := json.Unmarshal(signinData.Data, &signinResult); err != nil {
		t.Fatalf("failed to parse signin response: %v", err)
	}

	token, ok := signinResult["token"].(string)
	if !ok {
		t.Fatalf("expected token in signin response")
	}

	// Now fetch user with JWT token
	req, _ := http.NewRequest(http.MethodGet, "/api/user/"+userID, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    email,
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

	// Update user with JWT token
	updateReq, _ := http.NewRequest(http.MethodPut, "/api/user/"+userID, createJSONBody(map[string]interface{}{
		"name":  "Jane Doe",
		"phone": "9876543210",
	}))
	updateReq.Header.Set("Authorization", "Bearer "+token)
	updateReq.Header.Set("Content-Type", "application/json")
	updateW := httptest.NewRecorder()
	router.ServeHTTP(updateW, updateReq)
	if updateW.Code != http.StatusOK {
		t.Fatalf("update user expected 200, got %d", updateW.Code)
	}

	// Get updated user with JWT token
	getReq, _ := http.NewRequest(http.MethodGet, "/api/user/"+userID, nil)
	getReq.Header.Set("Authorization", "Bearer "+token)
	getW := httptest.NewRecorder()
	router.ServeHTTP(getW, getReq)
	if getW.Code != http.StatusOK {
		t.Fatalf("get after update expected 200, got %d", getW.Code)
	}
	updatedResp := parseResponse(t, getW)
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

	// Sign in to get JWT token
	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    email,
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

	// Delete user with JWT token
	delReq, _ := http.NewRequest(http.MethodDelete, "/api/user/"+userID, nil)
	delReq.Header.Set("Authorization", "Bearer "+token)
	delW := httptest.NewRecorder()
	router.ServeHTTP(delW, delReq)
	if delW.Code != http.StatusOK {
		t.Fatalf("delete user expected 200, got %d", delW.Code)
	}

	// Confirm deleted - since user is deleted but token is still valid, we get 404
	getReq, _ := http.NewRequest(http.MethodGet, "/api/user/"+userID, nil)
	getReq.Header.Set("Authorization", "Bearer "+token)
	getW := httptest.NewRecorder()
	router.ServeHTTP(getW, getReq)
	if getW.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete (user not found), got %d", getW.Code)
	}
}

func TestForgotAndResetPassword(t *testing.T) {
	router, _ := setupTestRouter(t)
	email := "resetme@example.com"
	signupUserAndGetID(t, router, email)

	forgot := performRequest(router, http.MethodPost, "/api/forgot-password", map[string]interface{}{
		"email": email,
	})
	if forgot.Code != http.StatusOK {
		t.Fatalf("forgot password expected 200, got %d", forgot.Code)
	}
	resp := parseResponse(t, forgot)
	var data map[string]interface{}
	if err := json.Unmarshal(resp.Data, &data); err != nil {
		t.Fatalf("parse forgot data: %v", err)
	}
	token, _ := data["reset_token"].(string)
	if token == "" {
		t.Fatalf("expected reset_token in response")
	}

	reset := performRequest(router, http.MethodPost, "/api/reset-password", map[string]interface{}{
		"token":        token,
		"new_password": "brandNewSecret456",
	})
	if reset.Code != http.StatusOK {
		t.Fatalf("reset password expected 200, got %d", reset.Code)
	}

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    email,
		"password": "brandNewSecret456",
	})
	if signin.Code != http.StatusOK {
		t.Fatalf("signin with new password expected 200, got %d", signin.Code)
	}
}
