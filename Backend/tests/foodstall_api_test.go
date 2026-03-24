package tests

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestFetchAllFoodStalls(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	w := performRequest(router, http.MethodGet, "/api/foodstalls", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	var stalls []map[string]interface{}
	if err := json.Unmarshal(resp.Data, &stalls); err != nil {
		t.Fatalf("failed parsing stalls: %v", err)
	}
	if len(stalls) == 0 {
		t.Fatalf("expected seeded stalls, got 0")
	}
}

func TestGetMenuForSpecificFoodStall(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	w := performRequest(router, http.MethodGet, "/api/foodstalls/stall_1/menu", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	resp := parseResponse(t, w)
	var items []map[string]interface{}
	if err := json.Unmarshal(resp.Data, &items); err != nil {
		t.Fatalf("failed parsing menu items: %v", err)
	}
	if len(items) == 0 {
		t.Fatalf("expected menu items, got 0")
	}
}

