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

type CrawlData struct {
	URL            string
	HTMLVersion    string
	Title          string
	H1Count        int
	H2Count        int
	H3Count        int
	H4Count        int
	H5Count        int
	H6Count        int
	InternalLinks  int
	ExternalLinks  int
	BrokenLinks    int
	HasLoginForm   bool
	ProcessingTime float64
}

type Crawler struct {
	client *http.Client
}

func NewCrawler() *Crawler {
	return &Crawler{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Crawler) Crawl(targetURL string) (*CrawlData, error) {
	startTime := time.Now()
	resp, err := c.client.Get(targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received non-200 status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	doc, err := html.Parse(bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	data := &CrawlData{
		URL:         targetURL,
		HTMLVersion: getHTMLVersion(doc),
		Title:       getTitle(doc),
	}

	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch n.Data {
			case "title":
				if n.FirstChild != nil {
					data.Title = n.FirstChild.Data
				}
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
			f(c)
		}
	}
	f(doc)

	data.ProcessingTime = time.Since(startTime).Seconds()
	return data, nil
}

func getTitle(n *html.Node) string {
	// First try to find <title> tag
	if titleNode := findTag(n, "title"); titleNode != nil && titleNode.FirstChild != nil {
		return titleNode.FirstChild.Data
	}

	// Fallback to first <h1> if no title exists
	if h1Node := findTag(n, "h1"); h1Node != nil && h1Node.FirstChild != nil {
		return h1Node.FirstChild.Data
	}

	return ""
}

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

func getHTMLVersion(n *html.Node) string {
	if n.Type == html.DoctypeNode {
		for _, attr := range n.Attr {
			if attr.Key == "public" {
				if strings.Contains(attr.Val, "HTML 4.01") {
					return "HTML 4.01"
				} else if strings.Contains(attr.Val, "XHTML 1.0") {
					return "XHTML 1.0"
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
	return "HTML5" // default
}

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

func hasPasswordField(n *html.Node) bool {
	if n.Type == html.ElementNode && n.Data == "input" {
		for _, attr := range n.Attr {
			if attr.Key == "type" && attr.Val == "password" {
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
