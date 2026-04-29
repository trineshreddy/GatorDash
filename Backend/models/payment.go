package models

// PaymentRequest represents a mock payment payload.
type PaymentRequest struct {
	UserID         string  `json:"user_id,omitempty"`
	Amount         float64 `json:"amount" binding:"required,gt=0"`
	CardholderName string  `json:"cardholder_name" binding:"required"`
	CardNumber     string  `json:"card_number" binding:"required"`
	ExpiryMonth    string  `json:"expiry_month" binding:"required"`
	ExpiryYear     string  `json:"expiry_year" binding:"required"`
	CVV            string  `json:"cvv" binding:"required"`
	BillingZIP     string  `json:"billing_zip,omitempty"`
}

// PaymentResponse is returned for mock payment processing.
type PaymentResponse struct {
	TransactionID string  `json:"transaction_id"`
	Approved      bool    `json:"approved"`
	Amount        float64 `json:"amount"`
	Message       string  `json:"message"`
}
