package utils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"golang.org/x/time/rate"
)

// HTTPClient provides a robust HTTP client with retry and rate limiting
type HTTPClient struct {
	client      *http.Client
	rateLimiter *rate.Limiter
	maxRetries  int
	userAgent   string
}

// NewHTTPClient creates a new HTTP client with the specified rate limit
func NewHTTPClient(requestsPerSecond int, maxRetries int) *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		rateLimiter: rate.NewLimiter(rate.Limit(requestsPerSecond), requestsPerSecond),
		maxRetries:  maxRetries,
		userAgent:   "Stellar-Hackathon-Scraper/1.0",
	}
}

// Get performs a GET request with retry logic and rate limiting
func (c *HTTPClient) Get(ctx context.Context, url string) ([]byte, error) {
	// Wait for rate limiter
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limiter error: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt < c.maxRetries; attempt++ {
		if attempt > 0 {
			// Exponential backoff
			backoff := time.Duration(attempt) * time.Second
			Logger.Warnf("Retry attempt %d/%d after %v for %s", attempt+1, c.maxRetries, backoff, url)
			time.Sleep(backoff)
		}

		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("User-Agent", c.userAgent)
		req.Header.Set("Accept", "application/json")

		resp, err := c.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		defer resp.Body.Close()

		// Handle different status codes
		switch {
		case resp.StatusCode >= 200 && resp.StatusCode < 300:
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return nil, fmt.Errorf("failed to read response body: %w", err)
			}
			return body, nil

		case resp.StatusCode == 429:
			// Rate limited - check Retry-After header
			retryAfter := resp.Header.Get("Retry-After")
			if retryAfter != "" {
				duration, err := time.ParseDuration(retryAfter + "s")
				if err == nil {
					Logger.Warnf("Rate limited, waiting %v", duration)
					time.Sleep(duration)
					continue
				}
			}
			lastErr = fmt.Errorf("rate limited (429)")
			continue

		case resp.StatusCode >= 500:
			lastErr = fmt.Errorf("server error: %d", resp.StatusCode)
			continue

		default:
			body, _ := io.ReadAll(resp.Body)
			return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
		}
	}

	return nil, fmt.Errorf("max retries exceeded: %w", lastErr)
}

// SetUserAgent sets a custom user agent string
func (c *HTTPClient) SetUserAgent(ua string) {
	c.userAgent = ua
}
