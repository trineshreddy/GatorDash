package tests

import (
	"encoding/json"
	"net/http"
	"net/url"
	"testing"
)

func TestGetAllMenuItems(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	w := performRequest(router, http.MethodGet, "/api/menu-items", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("get all menu items expected 200, got %d", w.Code)
	}
	resp := parseResponse(t, w)
	var items []map[string]interface{}
	if err := json.Unmarshal(resp.Data, &items); err != nil {
		t.Fatalf("parse menu items: %v", err)
	}
	if len(items) != 70 {
		t.Fatalf("expected 70 menu items, got %d", len(items))
	}
}

func TestGetMenuItemsByName(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	q := url.Values{}
	q.Set("name", "Classic Gator Burger")
	path := "/api/menu-items/by-name?" + q.Encode()

	w := performRequest(router, http.MethodGet, path, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("get menu by name expected 200, got %d", w.Code)
	}
	resp := parseResponse(t, w)
	var items []map[string]interface{}
	if err := json.Unmarshal(resp.Data, &items); err != nil {
		t.Fatalf("parse menu items: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 menu item, got %d", len(items))
	}
	if items[0]["name"] != "Classic Gator Burger" {
		t.Fatalf("unexpected item name %v", items[0]["name"])
	}
}

func TestGetMenuItemsByNameMissingQuery(t *testing.T) {
	router, _ := setupTestRouter(t)

	w := performRequest(router, http.MethodGet, "/api/menu-items/by-name", nil)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 without name, got %d", w.Code)
	}
}

func TestGetMenuItemsByNameNotFound(t *testing.T) {
	router, db := setupTestRouter(t)
	seedFoodData(t, db)

	q := url.Values{}
	q.Set("name", "Nonexistent Dish XYZ")
	path := "/api/menu-items/by-name?" + q.Encode()

	w := performRequest(router, http.MethodGet, path, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for unknown name, got %d", w.Code)
	}
}
