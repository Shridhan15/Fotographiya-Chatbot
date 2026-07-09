// Backend/src/services/scraperService.js
// ========================================
// HYBRID SCRAPER - LIVE DATA + HARDCODED FALLBACK
// ========================================

const axios = require("axios");
const cheerio = require("cheerio");
const companyData = require("../data/companyData");
const puppeteerScraper = require("./puppeteerScraper");

// ✅ DEBUG - Check if companyData loaded
console.log("📦 companyData loaded in scraperService:", !!companyData);
console.log("🏢 companyData.company exists:", !!companyData?.company);

class ScraperService {
  constructor() {
    this.scrapedData = {};
    this.isScraping = false;
    this.lastScrapeTime = null;
  }

  // ================================================
  // 🔍 SCRAPED DATA GET KARO
  // ================================================
  getScrapedData() {
    return this.scrapedData;
  }

  // ===== companyData.js se saare page URLs lo =====
  getAllPageUrls() {
    const urls = [];

    const pages = companyData.pages || {};
    for (const [key, url] of Object.entries(pages)) {
      if (url && typeof url === "string" && url.startsWith("http")) {
        urls.push({ key, url });
      }
    }

    const links = companyData.links || [];
    if (Array.isArray(links)) {
      for (const url of links) {
        if (url && typeof url === "string" && url.startsWith("http")) {
          const exists = urls.some((u) => u.url === url);
          if (!exists) {
            urls.push({ key: `link_${urls.length}`, url });
          }
        }
      }
    }

    return urls;
  }

  // ===== EK PAGE SCRAPE KARO (LIVE DATA) =====
  async scrapePage(url, key) {
    try {
      console.log(`🌐 Scraping LIVE: ${key} - ${url}`);

      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      $(
        "script, style, nav, footer, header, .nav, .menu, .sidebar, .ads, .popup, .cookie-banner",
      ).remove();

      const title = $("title").text().trim();
      const metaDescription =
        $('meta[name="description"]').attr("content") || "";

      const headings = [];
      $("h1, h2, h3").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0) headings.push(text);
      });

      const paragraphs = [];
      $("p").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) paragraphs.push(text);
      });

      const listItems = [];
      $("li").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) listItems.push(text);
      });

      let content = "";
      $(
        "main, article, .content, .main-content, .page-content, .section, .container, body",
      ).each((i, el) => {
        content += $(el).text().trim() + "\n";
      });
      content = content
        .replace(/\s+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return {
        key,
        url,
        success: true,
        title,
        metaDescription,
        headings: headings.slice(0, 20),
        paragraphs: paragraphs.slice(0, 30),
        listItems: listItems.slice(0, 30),
        content: content.slice(0, 5000),
        scrapedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Error scraping ${key}:`, error.message);
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
      };
    }
  }

  // ===== SAARE PAGES SCRAPE KARO =====
  async scrapeAllPages() {
    if (this.isScraping) {
      console.log("⏳ Scraping already in progress...");
      return this.scrapedData;
    }

    // 🔥 TRY PUPPETEER FIRST
    console.log("🔄 Trying Puppeteer scraper...");
    try {
      const puppeteerResults = await puppeteerScraper.scrapeAllPages();

      const successCount = Object.values(puppeteerResults).filter(
        (r) => r.success === true,
      ).length;

      if (successCount > 0) {
        console.log(`✅ Puppeteer scraped ${successCount} pages successfully!`);
        this.scrapedData = puppeteerResults;
        this.lastScrapeTime = new Date();
        this.isScraping = false;
        return this.scrapedData;
      } else {
        console.log("⚠️ Puppeteer scraped 0 pages, falling back to Cheerio...");
      }
    } catch (error) {
      console.log("⚠️ Puppeteer failed:", error.message);
      console.log("🔄 Falling back to Cheerio...");
    }

    // 🟡 FALLBACK: Purana Cheerio scraper use karo
    console.log("🔄 Starting Cheerio website scrape (fallback)...");

    this.isScraping = true;
    const pageUrls = this.getAllPageUrls();
    const results = {};

    const concurrency = 2;
    for (let i = 0; i < pageUrls.length; i += concurrency) {
      const chunk = pageUrls.slice(i, i + concurrency);
      const promises = chunk.map(({ key, url }) => this.scrapePage(url, key));
      const chunkResults = await Promise.all(promises);

      chunkResults.forEach((result) => {
        results[result.key] = result;
      });
    }

    this.scrapedData = results;
    this.lastScrapeTime = new Date();
    this.isScraping = false;

    const successCount = Object.values(results).filter((r) => r.success).length;
    console.log(
      `✅ Cheerio scraped ${successCount}/${Object.keys(results).length} pages successfully!`,
    );

    return results;
  }

  // ================================================
  // 🔍 SMART SEARCH
  // ================================================
  normalizeQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "");
  }

  textMatchesQuery(text, query) {
    if (!text) return false;

    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    if (textLower.includes(queryLower)) return true;

    const queryNoSpace = queryLower.replace(/\s/g, "");
    const textNoSpace = textLower.replace(/\s/g, "");
    if (textNoSpace.includes(queryNoSpace)) return true;

    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    if (queryWords.length >= 2) {
      let matchCount = 0;
      for (const word of queryWords) {
        if (textLower.includes(word)) matchCount++;
      }
      if (matchCount >= Math.ceil(queryWords.length / 2)) return true;
    }

    return false;
  }

  // ================================================
  // 🔍 SEARCH IN LIVE DATA
  // ================================================
  // scraperService.js - searchInScrapedData() FIXED
searchInScrapedData(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  // Golden Box special check (already hai)
  // ...
  
  for (const [key, data] of Object.entries(this.scrapedData)) {
    if (!data.success) continue;
    
    const matches = [];
    
    // Content search
    if (data.content && this.textMatchesQuery(data.content, query)) {
      const idx = data.content.toLowerCase().indexOf(queryLower);
      const snippet = data.content.substring(
        Math.max(0, idx - 60),
        Math.min(data.content.length, idx + 120)
      );
      matches.push({ type: "content", snippet: snippet.trim() });
    }
    
    // Headings search
    for (const heading of data.headings || []) {
      if (this.textMatchesQuery(heading, query)) {
        matches.push({ type: "heading", snippet: heading });
      }
    }
    
    if (matches.length > 0) {
      results.push({
        page: key,
        // ❌ HATAO: url: data.url,
        title: data.title || key,
        source: "LIVE (Scraped)",
        matches: matches.slice(0, 5)
        // ✅ URL NAHI DEGA
      });
    }
  }
  
  return results;
}

  // ================================================
  // 📦 SEARCH IN HARDCODED DATA
  // ================================================
  searchInHardcodedData(query) {
    const queryLower = query.toLowerCase().trim();
    const results = [];
    const allMatches = [];

    // Golden Box special check
    const goldenBoxKeywords = [
      "golden box", "goldenbox", "gb", "qr photo", "instant photo"
    ];
    const isGoldenBoxQuery = goldenBoxKeywords.some(
      (kw) => queryLower.includes(kw) || kw.includes(queryLower),
    );

    const goldenBox = companyData.goldenBox || {};
    if (isGoldenBoxQuery && Object.keys(goldenBox).length > 0) {
      let content = `📦 GOLDENBOX\n`;
      content += `Description: ${goldenBox.description || "AI-powered photo delivery system"}\n`;
      if (goldenBox.features) {
        content += `Features: ${goldenBox.features.join(", ")}\n`;
      }
      if (goldenBox.aiPowered) {
        content += `AI Powered: ${goldenBox.aiPowered}\n`;
      }
      if (goldenBox.steps) {
        content += `How it works: Capture → AI Processing → QR Display → Download\n`;
      }

      return [{
        page: "goldenbox",
        url: companyData.company?.website || "https://www.fotographiya.com",
        title: "GoldenBox - AI Photo Delivery System",
        source: "HARDCODED (Golden Box Direct)",
        matches: [{
          type: "content",
          snippet: content.slice(0, 400),
        }, ],
      }, ];
    }

    // RECURSIVE SEARCH
    function searchInObject(obj, path = "") {
      if (!obj) return;

      if (typeof obj === "string") {
        if (obj.toLowerCase().includes(queryLower)) {
          allMatches.push({
            path: path,
            value: obj.slice(0, 200),
          });
        }
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          searchInObject(item, `${path}[${index}]`);
        });
        return;
      }

      if (typeof obj === "object") {
        for (const [key, value] of Object.entries(obj)) {
          if (key.toLowerCase().includes(queryLower)) {
            allMatches.push({
              path: path ? `${path}.${key}` : key,
              value: `[KEY: ${key}] ${JSON.stringify(value).slice(0, 100)}`,
            });
          }
          searchInObject(value, path ? `${path}.${key}` : key);
        }
      }
    }

    searchInObject(companyData);

    if (allMatches.length > 0) {
      const groupedMatches = {};
      for (const match of allMatches) {
        const category = match.path.split(".")[0] || "general";
        if (!groupedMatches[category]) groupedMatches[category] = [];
        groupedMatches[category].push(match);
      }

      for (const [category, matches] of Object.entries(groupedMatches)) {
        const categoryNames = {
          company: "🏢 Company Info",
          team: "👥 Team",
          packages: "📦 Packages",
          services: "🎯 Services",
          goldenBox: "✨ GoldenBox",
          academy: "🎓 Academy",
          about: "📖 About Us",
          booking: "📋 Booking",
          payment: "💳 Payment",
          portfolio: "🖼️ Portfolio",
          faq: "❓ FAQ",
          testimonials: "⭐ Testimonials",
          socialMedia: "📱 Social Media",
        };

        results.push({
          page: "hardcoded",
          url: companyData.company?.website || "https://www.fotographiya.com",
          title: `Fotographiya - ${categoryNames[category] || category}`,
          source: "HARDCODED (Fallback)",
          matches: matches.slice(0, 5).map((m) => ({
            type: "content",
            snippet: m.value,
          })),
        });
      }
    }

    return results;
  }

  // ================================================
  // 🎯 HYBRID SEARCH
  // ================================================
  // scraperService.js - searchHybrid() FIXED
searchHybrid(query) {
  let liveResults = this.searchInScrapedData(query);
  
  // ✅ URLs hata do
  for (const result of liveResults) {
    delete result.url; // URL hatao
    // Ya: result.url = "Website page" // Text mein convert karo
  }
  
  if (liveResults.length > 0) {
    console.log(`✅ Found ${liveResults.length} results in LIVE data`);
    return liveResults;
  }
  
  let hardcodedResults = this.searchInHardcodedData(query);
  
  // ✅ URLs hata do
  for (const result of hardcodedResults) {
    delete result.url;
  }
  
  return hardcodedResults;
}

  // ================================================
  // 🧠 BUILD AI CONTEXT - FIXED
  // ================================================
  // scraperService.js - buildContextForAI() FIXED
buildContextForAI(userMessage) {
  const query = userMessage.toLowerCase();
  const contextParts = [];
  
  // ===== PART 1: HARDCODED DATA - SIRF TEXT =====
  const c = companyData.company || {};
  contextParts.push(`🏢 COMPANY: ${c.name || 'Fotographiya'}`);
  contextParts.push(`📍 Location: ${c.location || 'Kota, Rajasthan, India'}`);
  contextParts.push(`📞 Phone: ${c.phone || '+91 9001110144'}`);
  contextParts.push(`📧 Email: ${c.email || 'fotographiyaworld@gmail.com'}`);
  contextParts.push(`👤 Founder: ${c.founder || 'Mohit Barthunia'}`);
  
  // ===== PART 2: SERVICES - SIRF TEXT =====
  const services = companyData.services || {};
  contextParts.push("\n🎯 SERVICES:");
  if (services.wedding) contextParts.push(`• Wedding: ${services.wedding.description}`);
  if (services.prewedding) contextParts.push(`• Pre-Wedding: ${services.prewedding.description}`);
  if (services.destination) contextParts.push(`• Destination: ${services.destination.description}`);
  
  // ===== PART 3: PACKAGES - SIRF TEXT =====
  const packages = companyData.packages || {};
  contextParts.push("\n📦 PACKAGES:");
  if (packages.silver) contextParts.push(`• Silver: ${packages.silver.includes}`);
  if (packages.golden) contextParts.push(`• Golden: ${packages.golden.includes}`);
  if (packages.premium) contextParts.push(`• Premium: ${packages.premium.includes}`);
  
  // ===== PART 4: LIVE DATA - SIRF CONTENT, NO URLS =====
  contextParts.push("\n📄 WEBSITE CONTENT:");
  
  // 🔍 Search in scraped data
  const searchResults = this.searchHybrid(query);
  
  if (searchResults && searchResults.length > 0) {
    for (const result of searchResults.slice(0, 3)) {
      // ❌ HATAO: contextParts.push(`URL: ${result.url}`);
      
      // ✅ SIRF CONTENT DO:
      if (result.title) {
        contextParts.push(`📌 ${result.title}`);
      }
      
      if (result.matches && Array.isArray(result.matches)) {
        for (const match of result.matches.slice(0, 3)) {
          // Sirf text content
          if (match.type === 'heading') {
            contextParts.push(`📌 ${match.snippet}`);
          } else if (match.type === 'list') {
            contextParts.push(`• ${match.snippet}`);
          } else {
            contextParts.push(`📝 ${match.snippet}`);
          }
        }
      }
    }
  } else {
    // Agar kuch nahi mila toh generic info do
    contextParts.push("• Wedding Photography services available");
    contextParts.push("• Pre-Wedding and Destination Wedding packages");
    contextParts.push("• GoldenBox AI technology for instant photo delivery");
    contextParts.push("• Fotographiya Academy for professional courses");
  }
  
  // ===== PART 5: GOLDEN BOX - SIRF TEXT =====
  const goldenBox = companyData.goldenBox || {};
  if (Object.keys(goldenBox).length > 0) {
    contextParts.push("\n✨ GOLDENBOX:");
    contextParts.push(`Description: ${goldenBox.description}`);
    if (goldenBox.features) {
      contextParts.push(`Features: ${goldenBox.features.join(", ")}`);
    }
  }
  
  // ===== PART 6: ACADEMY - SIRF TEXT =====
  const academy = companyData.academy || {};
  if (Object.keys(academy).length > 0) {
    contextParts.push("\n🎓 ACADEMY:");
    contextParts.push(`Description: ${academy.description}`);
    if (academy.courses) {
      contextParts.push(`Courses: ${academy.courses.join(", ")}`);
    }
  }
  
  return contextParts.join("\n");
}

  // ===== STATUS =====
  getStatus() {
    const total = Object.keys(this.scrapedData).length;
    const success = Object.values(this.scrapedData).filter(
      (r) => r.success,
    ).length;
    return {
      totalPages: total,
      successPages: success,
      failedPages: total - success,
      lastScrape: this.lastScrapeTime,
      isScraping: this.isScraping,
    };
  }
}

module.exports = new ScraperService();