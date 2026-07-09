// Backend/src/services/puppeteerScraper.js
// ========================================
// PUPPETEER SCRAPER - DYNAMIC CONTENT SUPPORT
// ========================================

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const companyData = require("../data/companyData");

puppeteer.use(StealthPlugin());

class PuppeteerScraper {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
    this.scrapedData = {};
    this.lastScrapeTime = null;
    this.isScraping = false;
  }

  // ================================================
  // 🚀 BROWSER INITIALIZE KARO
  // ================================================
  async initializeBrowser() {
    if (this.isInitialized && this.browser) {
      console.log("✅ Browser already initialized");
      return this.browser;
    }

    try {
      console.log("🔄 Launching Puppeteer browser...");

      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-gl-drawing-for-tests",
          "--disable-gpu-compositing",
          "--disable-gpu-sandbox",
          "--disable-gpu-driver-bug-workarounds",
          "--window-size=1920,1080",
          "--disable-features=IsolateOrigins,site-per-process",
          "--disable-blink-features=AutomationControlled",
          "--disable-web-security",
          "--disable-site-isolation-trials",
        ],
        timeout: 60000,
        ignoreHTTPSErrors: true,
      });

      this.isInitialized = true;
      console.log("✅ Puppeteer browser launched successfully!");
      return this.browser;
    } catch (error) {
      console.error("❌ Failed to launch browser:", error.message);
      throw error;
    }
  }

  // ================================================
  // 📄 EK PAGE SCRAPE KARO
  // ================================================
  async scrapePage(url, key) {
    let page = null;

    try {
      console.log(`🌐 Scraping with Puppeteer: ${key} - ${url}`);

      if (!this.isInitialized || !this.browser) {
        await this.initializeBrowser();
      }

      page = await this.browser.newPage();

      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

      await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 1080 + Math.floor(Math.random() * 100),
      });
      await page.setUserAgent(randomUA);

      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      });

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
        window.chrome = { runtime: {} };
      });

      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);

      let response = null;
      let retries = 0;
      while (retries < 3 && !response) {
        try {
          response = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        } catch (e) {
          retries++;
          console.log(`🔄 Retry ${retries} for ${key}`);
          await page.waitForTimeout(2000);
        }
      }

      if (!response) {
        throw new Error("Failed to load page after 3 retries");
      }

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}`);
      }

      const delay = Math.floor(Math.random() * 2000) + 1000;
      await page.waitForTimeout(delay);

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * Math.random());
      });
      await page.waitForTimeout(500 + Math.random() * 1000);

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);

      const title = await page.evaluate(() => {
        return document.querySelector("title")?.innerText?.trim() || "";
      });

      const metaDescription = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta?.content?.trim() || "";
      });

      const headings = await page.evaluate(() => {
        const h1 = Array.from(document.querySelectorAll("h1, h2, h3"));
        return h1.map(el => el.innerText.trim()).filter(text => text.length > 0);
      });

      const paragraphs = await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll("p"));
        return p.map(el => el.innerText.trim()).filter(text => text.length > 20);
      });

      const listItems = await page.evaluate(() => {
        const li = Array.from(document.querySelectorAll("li"));
        return li.map(el => el.innerText.trim()).filter(text => text.length > 10);
      });

      const content = await page.evaluate(() => {
        let content = "";
        const selectors = ["main", "article", ".content", ".main-content", ".page-content", ".section", ".container"];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            if (el.innerText && el.innerText.trim().length > 100) {
              content += el.innerText.trim() + "\n";
            }
          }
        }
        
        if (!content || content.length < 100) {
          content = document.body?.innerText?.trim() || "";
        }
        return content;
      });

      const cleanedContent = content
        .replace(/\s+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, 5000);

      await page.close();

      return {
        key,
        url,
        success: true,
        title,
        metaDescription,
        headings: headings.slice(0, 20),
        paragraphs: paragraphs.slice(0, 30),
        listItems: listItems.slice(0, 30),
        content: cleanedContent,
        scrapedAt: new Date().toISOString(),
        source: "PUPPETEER (Live)",
      };
    } catch (error) {
      console.error(`❌ Puppeteer scraping failed for ${key}:`, error.message);
      if (page) {
        try { await page.close(); } catch (e) {}
      }
      return {
        key,
        url,
        success: false,
        error: error.message,
        title: "",
        metaDescription: "",
        headings: [],
        paragraphs: [],
        listItems: [],
        content: "",
        scrapedAt: new Date().toISOString(),
        source: "PUPPETEER (Failed)",
      };
    }
  }

  // ================================================
  // 🔄 SAARE PAGES SCRAPE KARO
  // ================================================
  async scrapeAllPages() {
    if (this.isScraping) {
      console.log("⏳ Scraping already in progress...");
      return this.scrapedData;
    }

    this.isScraping = true;
    console.log("🔄 Starting Puppeteer scrape of all pages...");

    try {
      await this.initializeBrowser();

      const pageUrls = [];
      for (const [key, url] of Object.entries(companyData.pages)) {
        if (url && typeof url === "string" && url.startsWith("http")) {
          pageUrls.push({ key, url });
        }
      }

      if (companyData.links && Array.isArray(companyData.links)) {
        for (const url of companyData.links) {
          if (url && typeof url === "string" && url.startsWith("http")) {
            const exists = pageUrls.some((u) => u.url === url);
            if (!exists) {
              pageUrls.push({ key: `link_${pageUrls.length}`, url });
            }
          }
        }
      }

      console.log(`📋 Total pages to scrape: ${pageUrls.length}`);

      const results = {};
      const concurrency = 2;

      for (let i = 0; i < pageUrls.length; i += concurrency) {
        const chunk = pageUrls.slice(i, i + concurrency);
        const promises = chunk.map(({ key, url }) => this.scrapePage(url, key));
        const chunkResults = await Promise.all(promises);

        chunkResults.forEach((result) => {
          results[result.key] = result;
        });

        console.log(`📊 Scraped ${Math.min(i + concurrency, pageUrls.length)}/${pageUrls.length} pages`);

        if (i + concurrency < pageUrls.length) {
          const batchDelay = Math.floor(Math.random() * 3000) + 2000;
          await new Promise((r) => setTimeout(r, batchDelay));
        }
      }

      this.scrapedData = results;
      this.lastScrapeTime = new Date();

      const successCount = Object.values(results).filter((r) => r.success).length;
      console.log(`✅ Puppeteer scraped ${successCount}/${Object.keys(results).length} pages successfully!`);

      this.isScraping = false;

      if (successCount === 0) {
        throw new Error("All pages failed to scrape");
      }

      return results;
    } catch (error) {
      console.error("❌ Puppeteer scraping failed:", error.message);
      this.isScraping = false;
      throw error;
    }
  }

  getScrapedData() {
    return this.scrapedData;
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.isInitialized = false;
        console.log("✅ Puppeteer browser closed");
      } catch (error) {
        console.error("❌ Error closing browser:", error.message);
      }
    }
  }

  getStatus() {
    const total = Object.keys(this.scrapedData).length;
    const success = Object.values(this.scrapedData).filter((r) => r.success).length;
    return {
      totalPages: total,
      successPages: success,
      failedPages: total - success,
      lastScrape: this.lastScrapeTime,
      isScraping: this.isScraping,
      browserInitialized: this.isInitialized,
      source: "PUPPETEER",
    };
  }

  search(query) {
    const queryLower = query.toLowerCase();
    const results = [];

    for (const [key, data] of Object.entries(this.scrapedData)) {
      if (!data.success) continue;

      const matches = [];
      
      if (data.content && data.content.toLowerCase().includes(queryLower)) {
        const idx = data.content.toLowerCase().indexOf(queryLower);
        const snippet = data.content.substring(
          Math.max(0, idx - 60),
          Math.min(data.content.length, idx + 120)
        );
        matches.push({ type: "content", snippet: snippet.trim() });
      }

      for (const heading of data.headings || []) {
        if (heading.toLowerCase().includes(queryLower)) {
          matches.push({ type: "heading", snippet: heading });
        }
      }

      for (const para of data.paragraphs || []) {
        if (para.toLowerCase().includes(queryLower)) {
          const idx = para.toLowerCase().indexOf(queryLower);
          const snippet = para.substring(
            Math.max(0, idx - 40),
            Math.min(para.length, idx + 80)
          );
          matches.push({ type: "paragraph", snippet: snippet.trim() });
        }
      }

      for (const item of data.listItems || []) {
        if (item.toLowerCase().includes(queryLower)) {
          matches.push({ type: "list", snippet: item });
        }
      }

      if (matches.length > 0) {
        results.push({
          page: key,
          url: data.url,
          title: data.title || key,
          source: data.source || "PUPPETEER",
          matches: matches.slice(0, 5)
        });
      }
    }

    return results;
  }
}

module.exports = new PuppeteerScraper();