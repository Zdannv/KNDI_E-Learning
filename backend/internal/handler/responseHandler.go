package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": data,
	})
}

func created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": data,
	})
}

func failed(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"error": message,
	})
}