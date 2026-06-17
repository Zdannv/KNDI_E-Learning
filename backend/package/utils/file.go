package utils

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func SaveBase64File(dataURL string, isAudio bool) (string, error) {
	if !strings.HasPrefix(dataURL, "data:") {
		return dataURL, nil
	}

	parts := strings.SplitN(dataURL, ";base64,", 2)
	if len(parts) != 2 {
		return dataURL, nil
	}

	header := parts[0]
	base64Data := parts[1]

	mimeType := strings.TrimPrefix(header, "data:")
	
	ext := ""
	if isAudio {
		if strings.Contains(mimeType, "mpeg") || strings.Contains(mimeType, "mp3") {
			ext = ".mp3"
		} else if strings.Contains(mimeType, "wav") {
			ext = ".wav"
		} else if strings.Contains(mimeType, "ogg") {
			ext = ".ogg"
		} else if strings.Contains(mimeType, "webm") {
			ext = ".webm"
		} else if strings.Contains(mimeType, "m4a") || strings.Contains(mimeType, "x-m4a") {
			ext = ".m4a"
		} else {
			ext = ".mp3"
		}
	} else {
		if strings.Contains(mimeType, "png") {
			ext = ".png"
		} else if strings.Contains(mimeType, "jpeg") || strings.Contains(mimeType, "jpg") {
			ext = ".jpg"
		} else if strings.Contains(mimeType, "gif") {
			ext = ".gif"
		} else if strings.Contains(mimeType, "svg") {
			ext = ".svg"
		} else if strings.Contains(mimeType, "webp") {
			ext = ".webp"
		} else {
			ext = ".png"
		}
	}

	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	folder := "./storage/questions/images"
	if isAudio {
		folder = "./storage/questions/audio"
	}
	if err := os.MkdirAll(folder, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(folder, filename)

	if err := os.WriteFile(filePath, decoded, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	publicPath := fmt.Sprintf("/storage/questions/images/%s", filename)
	if isAudio {
		publicPath = fmt.Sprintf("/storage/questions/audio/%s", filename)
	}

	return publicPath, nil
}

func UploadFile(r *http.Request, formKey, destFolder string) (*string, error) {
	file, header, err := r.FormFile(formKey)
	if err != nil {
		if err == http.ErrMissingFile {
			return nil, fmt.Errorf("File must uploaded")
		}
		return nil, fmt.Errorf("Failed to get file: %w", err)
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".pdf" && ext != ".pptx" {
		return nil, fmt.Errorf("File must be pdf or pptx!")
	}

	const maxSize = 50 << 20
	if header.Size > maxSize {
		return nil, fmt.Errorf("File size must not exceed 10MB")
	}

	if err := os.MkdirAll(destFolder, 0755); err != nil {
		return nil, fmt.Errorf("Failed to create storage directory: %w", err)
	}

	safeName := sanitizeFilename(header.Filename)
	fileName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), safeName)
	filePath := filepath.Join(destFolder, fileName)

	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("Failed to create file on server: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("Failed to write file: %w", err)
	}

	return &filePath, nil
}

func sanitizeFilename(filename string) string {
	var result strings.Builder
	for _, r := range filename {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '.' || r == '-' || r == '_' {
			result.WriteRune(r)
		} else if r == ' ' {
			result.WriteRune('_')
		}
	}
	return result.String()
}

func DeleteFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil
	}

	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("Failed to delete file: %w", err)
	}

	return nil
}