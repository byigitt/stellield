package export

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"time"

	"github.com/stellar-hackathon/scraper/internal/utils"
)

// CSVExporter handles exporting data to CSV files
type CSVExporter struct {
	outputDir string
}

// NewCSVExporter creates a new CSV exporter
func NewCSVExporter(outputDir string) *CSVExporter {
	return &CSVExporter{
		outputDir: outputDir,
	}
}

// Export exports data to a CSV file with timestamp
func (e *CSVExporter) Export(data interface{}, baseFilename string) (string, error) {
	// Ensure output directory exists
	if err := os.MkdirAll(e.outputDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create output directory: %w", err)
	}

	// Generate timestamped filename
	timestamp := time.Now().Format("2006-01-02_15-04-05")
	filename := fmt.Sprintf("%s_%s.csv", baseFilename, timestamp)
	filepath := filepath.Join(e.outputDir, filename)

	// Create file
	file, err := os.Create(filepath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Use reflection to handle different data types
	value := reflect.ValueOf(data)
	if value.Kind() == reflect.Ptr {
		value = value.Elem()
	}

	if value.Kind() != reflect.Slice {
		return "", fmt.Errorf("data must be a slice, got %s", value.Kind())
	}

	if value.Len() == 0 {
		utils.Logger.Warnf("No data to export for %s", baseFilename)
		return filepath, nil
	}

	// Get first element to extract headers
	firstElem := value.Index(0)
	if firstElem.Kind() == reflect.Ptr {
		firstElem = firstElem.Elem()
	}

	// Extract CSV headers from struct tags
	headers, fieldIndices := extractCSVHeaders(firstElem.Type())
	if err := writer.Write(headers); err != nil {
		return "", fmt.Errorf("failed to write headers: %w", err)
	}

	// Write data rows
	for i := 0; i < value.Len(); i++ {
		elem := value.Index(i)
		if elem.Kind() == reflect.Ptr {
			elem = elem.Elem()
		}

		row := extractCSVRow(elem, fieldIndices)
		if err := writer.Write(row); err != nil {
			return "", fmt.Errorf("failed to write row %d: %w", i, err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return "", fmt.Errorf("CSV writer error: %w", err)
	}

	utils.Logger.Infof("Exported %d records to %s", value.Len(), filename)
	return filepath, nil
}

// extractCSVHeaders extracts CSV column headers from struct tags
func extractCSVHeaders(t reflect.Type) ([]string, []int) {
	var headers []string
	var indices []int

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		csvTag := field.Tag.Get("csv")

		// Skip fields without csv tag or with "-"
		if csvTag == "" || csvTag == "-" {
			continue
		}

		headers = append(headers, csvTag)
		indices = append(indices, i)
	}

	return headers, indices
}

// extractCSVRow extracts values for CSV row
func extractCSVRow(v reflect.Value, fieldIndices []int) []string {
	row := make([]string, len(fieldIndices))

	for i, idx := range fieldIndices {
		field := v.Field(idx)
		row[i] = formatFieldValue(field)
	}

	return row
}

// formatFieldValue converts a field value to string for CSV
func formatFieldValue(v reflect.Value) string {
	// Handle nil pointers
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return ""
		}
		v = v.Elem()
	}

	switch v.Kind() {
	case reflect.String:
		return v.String()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return fmt.Sprintf("%d", v.Int())
	case reflect.Float32, reflect.Float64:
		return fmt.Sprintf("%.6f", v.Float())
	case reflect.Bool:
		if v.Bool() {
			return "true"
		}
		return "false"
	case reflect.Slice, reflect.Array:
		// Convert slices to comma-separated strings
		var items []string
		for i := 0; i < v.Len(); i++ {
			items = append(items, formatFieldValue(v.Index(i)))
		}
		return fmt.Sprintf("[%s]", joinStrings(items, ","))
	default:
		return fmt.Sprintf("%v", v.Interface())
	}
}

// joinStrings joins strings with a separator
func joinStrings(items []string, sep string) string {
	if len(items) == 0 {
		return ""
	}
	result := items[0]
	for i := 1; i < len(items); i++ {
		result += sep + items[i]
	}
	return result
}
