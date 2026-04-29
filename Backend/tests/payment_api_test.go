package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestProcessPaymentSuccess(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	// Signup user
	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Payment User",
		"email":    "payment@example.com",
		"phone":    "9999999997",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "payment@example.com",
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
	token, ok := signinData["token"].(string)
	if !ok || token == "" {
		t.Fatalf("expected token in signin response")
	}

	request, _ := http.NewRequest(http.MethodPost, "/api/payment/process", createJSONBody(map[string]interface{}{
		"amount":          32.50,
		"cardholder_name": "Payment User",
		"card_number":     "4242424242424242",
		"expiry_month":    "12",
		"expiry_year":     "2028",
		"cvv":             "123",
		"billing_zip":     "12345",
	}))
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, request)

	if w.Code != http.StatusOK {
		t.Fatalf("payment success expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected successful payment response")
	}

	var paymentData map[string]interface{}
	if err := json.Unmarshal(resp.Data, &paymentData); err != nil {
		t.Fatalf("failed to parse payment response: %v", err)
	}

	if paymentData["approved"] != true {
		t.Fatalf("expected payment approved to be true")
	}
	if paymentData["transaction_id"] == "" {
		t.Fatalf("expected transaction_id in payment response")
	}
}

func TestProcessPaymentDecline(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	signup := performRequest(router, http.MethodPost, "/api/signup", map[string]interface{}{
		"name":     "Decline User",
		"email":    "decline@example.com",
		"phone":    "9999999996",
		"password": "password123",
	})
	if signup.Code != http.StatusOK {
		t.Fatalf("signup expected 200, got %d", signup.Code)
	}

	signin := performRequest(router, http.MethodPost, "/api/signin", map[string]interface{}{
		"email":    "decline@example.com",
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
	token, ok := signinData["token"].(string)
	if !ok || token == "" {
		t.Fatalf("expected token in signin response")
	}

	request, _ := http.NewRequest(http.MethodPost, "/api/payment/process", createJSONBody(map[string]interface{}{
		"amount":          12.75,
		"cardholder_name": "Decline User",
		"card_number":     "4000000000000000",
		"expiry_month":    "12",
		"expiry_year":     "2028",
		"cvv":             "123",
		"billing_zip":     "12345",
	}))
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, request)

	if w.Code != http.StatusPaymentRequired {
		t.Fatalf("payment decline expected 402, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	if resp.Success {
		t.Fatalf("expected failed payment response")
	}
	if resp.Message == "" {
		t.Fatalf("expected error message for declined payment")
	}
}
