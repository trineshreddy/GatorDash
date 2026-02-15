package utils

import (
	"net/http"

	"gatordash-backend/models"

	"github.com/gin-gonic/gin"
)

// SendError sends an error response using Gin context
func SendError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, models.Response{
		Success: false,
		Message: message,
	})
}

// SendSuccess sends a success response using Gin context
func SendSuccess(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}