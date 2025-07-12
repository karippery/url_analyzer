package crawler

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"golang.org/x/net/html"
)

// CrawlData represents the result of a web crawling operation.
type CrawlData struct {
	URL            string  `json:"url"`
	HTMLVersion    string  `json:"html_version"`
	Title          string  `json:"title"`
	H1Count        int     `json:"h1_count"`
	H2Count        int     `json:"h2_count"`
	H3Count        int     `json:"h3_count"`
	H4Count        int     `json:"h4_count"`
	H5Count        int     `json:"h5_count"`
	H6Count        int     `json:"h6_count"`
	InternalLinks  int     `json:"internal_links"`
	ExternalLinks  int     `json:"external_links"`
	BrokenLinks    int     `json:"broken_links"`
	HasLoginForm   bool    `json:"has_login_form"`
	ProcessingTime float64 `json:"processing_time"`
}

// Crawler performs web crawling operations.
type Crawler struct {
	client *http.Client
}

// NewCrawler creates a new Crawler instance.
func NewCrawler() *Crawler {
	return &Crawler{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Crawl fetches and analyzes a webpage, returning crawl data.
func (c *Crawler) Crawl(targetURL string) (*CrawlData, error) {
	startTime := time.Now()

	// Validate URL
	if _, err := url.ParseRequestURI(targetURL); err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Fetch webpage
	resp, err := c.client.Get(targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL %s: %w", targetURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received status code %d for URL %s", resp.StatusCode, targetURL)
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body for URL %s: %w", targetURL, err)
	}

	// Parse HTML
	doc, err := html.Parse(bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML for URL %s: %w", targetURL, err)
	}

	data := &CrawlData{
		URL:         targetURL,
		HTMLVersion: getHTMLVersion(doc),
	}

	// Check for broken links in a separate goroutine
	go c.checkBrokenLinks(targetURL, doc, data)

	// Traverse HTML document
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch n.Data {
			case "h1":
				data.H1Count++
			case "h2":
				data.H2Count++
			case "h3":
				data.H3Count++
			case "h4":
				data.H4Count++
			case "h5":
				data.H5Count++
			case "h6":
				data.H6Count++
			case "a":
				for _, attr := range n.Attr {
					if attr.Key == "href" {
						if isInternalLink(targetURL, attr.Val) {
							data.InternalLinks++
						} else {
							data.ExternalLinks++
						}
					}
				}
			case "form":
				if hasPasswordField(n) {
					data.HasLoginForm = true
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}
	traverse(doc)

	// Set title
	data.Title = getTitle(doc)
	data.ProcessingTime = time.Since(startTime).Seconds()
	return data, nil
}

// checkBrokenLinks checks for broken links and updates the CrawlData.
func (c *Crawler) checkBrokenLinks(targetURL string, doc *html.Node, data *CrawlData) {
	var links []string
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			for _, attr := range n.Attr {
				if attr.Key == "href" && !isInternalLink(targetURL, attr.Val) {
					links = append(links, attr.Val)
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}
	traverse(doc)

	for _, link := range links {
		if resp, err := c.client.Head(link); err != nil || resp.StatusCode >= 400 {
			data.BrokenLinks++
		}
	}
}

// getTitle extracts the page title from the HTML document.
func getTitle(n *html.Node) string {
	if titleNode := findTag(n, "title"); titleNode != nil && titleNode.FirstChild != nil {
		return strings.TrimSpace(titleNode.FirstChild.Data)
	}
	if h1Node := findTag(n, "h1"); h1Node != nil && h1Node.FirstChild != nil {
		return strings.TrimSpace(h1Node.FirstChild.Data)
	}
	return ""
}

// findTag finds the first occurrence of a tag in the HTML document.
func findTag(n *html.Node, tagName string) *html.Node {
	if n.Type == html.ElementNode && n.Data == tagName {
		return n
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if found := findTag(c, tagName); found != nil {
			return found
		}
	}
	return nil
}

// getHTMLVersion determines the HTML version from the DOCTYPE node.
func getHTMLVersion(n *html.Node) string {
	if n.Type == html.DoctypeNode {
		for _, attr := range n.Attr {
			if attr.Key == "public" {
				switch {
				case strings.Contains(attr.Val, "HTML 4.01"):
					return "HTML 4.01"
				case strings.Contains(attr.Val, "XHTML 1.0"):
					return "XHTML 1.0"
				case strings.Contains(attr.Val, "XHTML 1.1"):
					return "XHTML 1.1"
				}
			}
		}
		return "HTML5"
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if version := getHTMLVersion(c); version != "" {
			return version
		}
	}
	return "HTML5"
}

// isInternalLink checks if a link is internal to the base URL.
func isInternalLink(baseURL, link string) bool {
	base, err := url.Parse(baseURL)
	if err != nil {
		return false
	}
	parsedLink, err := url.Parse(link)
	if err != nil {
		return false
	}
	return parsedLink.Host == "" || parsedLink.Host == base.Host
}

// hasPasswordField checks if a form contains a password input field.
func hasPasswordField(n *html.Node) bool {
	if n.Type == html.ElementNode && n.Data == "input" {
		for _, attr := range n.Attr {
			if attr.Key == "type" && strings.ToLower(attr.Val) == "password" {
				return true
			}
		}
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if hasPasswordField(c) {
			return true
		}
	}
	return false
}
