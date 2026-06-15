package utils

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

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
<<<<<<< HEAD

	const maxSize = 50 << 20
	if header.Size > maxSize {
		return nil, fmt.Errorf("File size must not exceed 10MB")
	}

=======
 
	const maxSize = 10 << 20
	if header.Size > maxSize {
		return nil, fmt.Errorf("File size must not exceed 10MB")
	}
 
>>>>>>> origin/main
	if err := os.MkdirAll(destFolder, 0755); err != nil {
		return nil, fmt.Errorf("Failed to create storage directory: %w", err)
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
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

func DeleteFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil
	}

	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("Failed to delete file: %w", err)
	}

	return nil
}