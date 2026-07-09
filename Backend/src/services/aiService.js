const axios = require("axios");
const companyData = require("../data/companyData");

// ============================================
// ✅ CONFIGURATION
// ============================================
class Config {
  static get GROQ_API_KEY() { return process.env.GROQ_API_KEY; }

  static get GROQ_API_URL() {
    return process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  }

  static get AI_MODEL() {
    return process.env.AI_MODEL || "llama-3.3-70b-versatile";
  }
}

// ============================================
// ✅ GROQ PROVIDER ONLY
// ============================================
class GroqProvider {
  constructor() {
    this.apiKey = Config.GROQ_API_KEY;
    this.url = Config.GROQ_API_URL;
    this.model = Config.AI_MODEL;
    this.timeout = 30000;
    this.temperature = 0.2;
    this.maxTokens = 200;
  }

  async getResponse(userMessage, systemPrompt) {
    if (!this.apiKey) {
      console.log('⚠️ Groq: No API key found');
      return null;
    }

    try {
      const response = await axios.post(
        this.url,
        {
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: this.timeout,
        }
      );

      const content = response.data.choices?.[0]?.message?.content;
      if (content) {
        console.log("✅ Groq Response Success!");
        return content;
      }
      return null;

    } catch (error) {
      console.log("⚠️ Groq Failed:", error.message);
      return null;
    }
  }
}

// ============================================
// ✅ PROMPT BUILDER - NO LINKS
// ============================================
class PromptBuilder {
  static buildSystemPrompt(context) {
    return `
You are Fotographiya's official AI photography assistant.

🚨 **IMPORTANT RULES:**
1. NEVER include any links in your responses
2. Just provide helpful text information
3. Keep responses clear and professional
4. Use emojis for visual appeal

🎯 **RESPONSE STRUCTURE:**
[Emoji] **Title**

[3-4 line summary - clear and professional]

**Key Points:**
• Point 1
• Point 2
• Point 3

💡 [Follow-up question]

========================================
✅ **CORRECT RESPONSE EXAMPLE:**
========================================
📱 **Fotographiya's Social Media Accounts**

Stay connected with us across all platforms to explore our photography services, behind-the-scenes content, and creative insights.

**Key Points:**
• Follow us on Facebook, Instagram, YouTube, Pexels, Reddit, LinkedIn, and Medium
• Engage with our community of 100+ happy couples
• Access exclusive content and photography tips

💡 Which platform would you like to connect with us on?

========================================
❌ **WRONG - NEVER DO THIS:**
========================================
• [Facebook](https://facebook.com) ← NO LINKS!
• [Instagram](https://instagram.com) ← NO LINKS!
• "Learn More:" with a link ← NO LINKS!
• Any markdown links [text](url) ← NO LINKS!

========================================
📌 **WHAT TO INCLUDE INSTEAD OF LINKS:**
========================================

SOCIAL MEDIA - just mention platform names:
• "Follow us on Facebook, Instagram, YouTube, Pexels, Reddit, LinkedIn, and Medium"

SERVICES - just mention service names:
• "We offer Wedding Photography, Pre-Wedding Photography, Destination Wedding, and Corporate Photography"

CONTACT - just mention contact methods:
• "You can reach us via WhatsApp, phone call, or email"

PACKAGES - just mention package names:
• "We offer Silver, Golden, and Premium packages"

PAGES - just mention page names:
• "Visit our About Us, Portfolio, Academy, and GoldenBox pages"

⚠️ **REMEMBER:**
- NO markdown links [text](url)
- NO "Learn More:" with links
- NO clickable links at all
- Just plain text with emojis and bullet points

COMPANY CONTEXT:
${context}
`;
  }
}

// ============================================
// ✅ RESPONSE FORMATTER - REMOVES ALL LINKS
// ============================================
class ResponseFormatter {
  static formatResponse(text) {
    if (!text) return text;

    let cleanText = text;

    cleanText = this._removeAllLinks(cleanText);
    cleanText = this._removeDuplicateHeaders(cleanText);
    cleanText = this._cleanSeparators(cleanText);
    cleanText = this._removeLearnMoreSections(cleanText);
    cleanText = this._cleanExtraSpaces(cleanText);

    return cleanText.trim();
  }

  static _removeAllLinks(text) {
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, (match, text) => text);
  }

  static _removeLearnMoreSections(text) {
    const lines = text.split('\n');
    const result = [];
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '**Learn More:**' || trimmed === 'Learn More:' ||
        trimmed.startsWith('**Learn More:**') || trimmed.startsWith('Learn More:')) {
        skipNextLine = true;
        continue;
      }

      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }
      result.push(line);
    }
    return result.join('\n');
  }

  static _removeDuplicateHeaders(text) {
    const lines = text.split('\n');
    const result = [];
    const seenHeaders = new Set();

    for (const line of lines) {
      const trimmed = line.trim();

      if (result.length === 0 && trimmed === '') continue;

      if (/^\s*[*#]*\s*Key Points:?\s*$/i.test(trimmed)) {
        if (seenHeaders.has('keypoints')) continue;
        seenHeaders.add('keypoints');
        result.push('**Key Points:**');
        continue;
      }
      result.push(line);
    }
    return result.join('\n');
  }

  static _cleanSeparators(text) {
    return text
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed !== '---' &&
          trimmed !== '===' &&
          trimmed !== '--' &&
          !/^[\-=\*]{3,}$/.test(trimmed);
      })
      .join('\n');
  }

  static _cleanExtraSpaces(text) {
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n');
  }
}

// ============================================
// ✅ FALLBACK RESPONSES - NO LINKS
// ============================================
class FallbackResponse {
  static getResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    if (this._isGreeting(msg)) return this._getGreetingResponse(msg);
    if (this._isFarewell(msg)) return this._getFarewellResponse();
    if (this._isInternational(msg)) return this._getInternationalResponse();

    const serviceResponse = this._getServiceResponse(msg);
    if (serviceResponse) return serviceResponse;

    if (this._isOffTopic(msg)) return this._getOffTopicResponse();

    return this._getDefaultResponse();
  }

  static _isGreeting(msg) {
    const greetings = ['hello', 'hi', 'hey', 'helloo', 'how are you', 'how r u', 'how are u'];
    return greetings.some(g => msg.includes(g) || msg === g);
  }

  static _getGreetingResponse(msg) {
    if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('how are u')) {
      return `I am doing well, thank you for asking! 😊 How can I assist you with Fotographiya today?`;
    }
    return `Hello! 👋 Welcome to Fotographiya. I'm your AI assistant. How may I help you today?`;
  }

  static _isFarewell(msg) {
    return msg.includes('bye') || msg.includes('goodbye');
  }

  static _getFarewellResponse() {
    return `Thank you for visiting Fotographiya! 👋 Have a wonderful day. Feel free to reach out anytime.`;
  }

  static _isInternational(msg) {
    const keywords = ['international', 'outside india', 'abroad', 'foreign', 'overseas',
      'bali', 'maldives', 'thailand', 'dubai', 'uae', 'usa', 'uk', 'europe', 'america'];
    return keywords.some(kw => msg.includes(kw));
  }

  static _getInternationalResponse() {
    return `❌ **No International Services**

Fotographiya only operates within India. We do not provide photography services outside India.

📍 **Our Coverage:**
• All Indian states including Rajasthan, Goa, Kerala, and Himachal Pradesh

💡 Would you like to know about our Indian destination wedding packages?`;
  }

  static _getServiceResponse(msg) {
    const serviceMap = [
      {
        keywords: ['social', 'all social', 'platforms', 'channels', 'social media'],
        response: `📱 **Fotographiya's Social Media Accounts**\n\nStay connected with us across all platforms to explore our photography services, behind-the-scenes content, and creative insights.\n\n**Key Points:**\n• Follow us on Facebook, Instagram, YouTube, Pexels, Reddit, LinkedIn, and Medium\n• Engage with our community of 100+ happy couples\n• Access exclusive content and photography tips\n\n💡 Which platform would you like to connect with us on?`
      },
      {
        keywords: ['package', 'pricing', 'cost', 'budget', 'price', 'rate', 'charges', 'silver', 'golden', 'premium'],
        response: `📦 **Our Photography Packages**\n\nWe offer three comprehensive photography packages to suit every couple's needs and budget.\n\n**Key Points:**\n• Silver Package: Basic wedding coverage with professional photography, edited digital photos, and online gallery\n• Golden Package: Comprehensive coverage with photography and cinematography, professional editing, album, and online gallery\n• Premium Package: Premium coverage with photography, cinematography, drone shots, premium album, and all digital assets\n\n💡 Which package interests you the most?`
      },
      {
        keywords: ['birthday', 'cake smash', 'kids birthday', 'birthday party', 'birthday celebration'],
        response: `🎂 **Birthday Photography Services**\n\nWe capture the joy, laughter, and love that fills the air on your special day. From the first slice of cake to the last dance, we freeze those moments forever.\n\n**Key Points:**\n• Professional birthday photography covering every moment\n• Fun cake smash sessions for kids and adults\n• Beautiful portraits capturing personality\n• Complete party coverage from start to finish\n• Premium printed albums and digital frames\n\n💡 Would you like to know about our birthday photography packages?`
      },
      {
        keywords: ['roka', 'pre engagement', 'tilak', 'ring ceremony', 'roka ritual'],
        response: `💍 **Roka Ceremony Photography**\n\nThe Roka ceremony is one of the most cherished pre-wedding rituals in Indian culture. We capture every ritual, emotion, and sacred moment of this beautiful tradition.\n\n**Key Points:**\n• Professional photography covering all rituals\n• Cinematic videography available\n• Candid photography capturing real emotions\n• Traditional coverage of tilak, ring exchange, and blessings\n• Premium leather albums and canvas prints\n\n💡 Would you like to know more about our Roka photography packages?`
      },
      {
        keywords: ['wedding'],
        response: `💍 **Wedding Photography Services**\n\nWe provide comprehensive wedding photography covering all ceremonies - from pre-wedding rituals to the reception, with professional editing and creative storytelling.\n\n**Key Points:**\n• Candid and traditional photography\n• Cinematic videography\n• Full-day coverage with professional editing\n\n💡 Would you like to see our wedding portfolio?`
      },
      {
        keywords: ['pre wedding', 'prewedding'],
        response: `📸 **Pre-Wedding Photography Services**\n\nWe offer professional pre-wedding photography services for couples. Our team captures romantic moments at scenic locations with expert editing and creative direction.\n\n**Key Points:**\n• Available at multiple scenic locations\n• Professional editing and retouching\n• Customized packages for every couple\n\n💡 Would you like to see our portfolio?`
      },
      {
        keywords: ['destination'],
        response: `🏖️ **Destination Wedding Photography**\n\nWe offer professional destination wedding photography services across India. Our team covers all major Indian destinations including Rajasthan, Goa, Kerala, and Himachal Pradesh.\n\n**Key Points:**\n• Available in Rajasthan, Goa, Kerala, and Himachal Pradesh\n• Professional photography and cinematography\n• Customized packages with travel and accommodation arrangements\n\n💡 Would you like to know more about our destination wedding packages?`
      },
      {
        keywords: ['contact', 'phone', 'call', 'email'],
        response: `📞 **Contact Fotographiya**\n\nYou can reach us through multiple channels for inquiries, bookings, and consultations.\n\n**Key Points:**\n• WhatsApp: +91 9001110144\n• Phone Call: +91 9001110144\n• Email: fotographiyaworld@gmail.com\n• Office: Kota, Rajasthan\n\n💡 How can we assist you today?`
      },
      {
        keywords: ['goldenbox', 'golden box', 'qr'],
        response: `✨ **GoldenBox - AI Photo Delivery System**\n\nGoldenBox is our innovative AI-powered system that delivers high-quality event photos instantly to attendees without requiring internet or app downloads.\n\n**Key Points:**\n• No internet required\n• No app download needed\n• 3-second instant download with AI-enhanced premium quality\n\n💡 Would you like to know more about GoldenBox?`
      },
      {
        keywords: ['academy', 'course', 'learn', 'training'],
        response: `🎓 **Fotographiya Academy**\n\nFotographiya Academy offers professional photography and videography courses with paid internships and industry-recognized certification.\n\n**Key Points:**\n• 8 comprehensive courses available\n• 4-month paid internship\n• Industry-recognized certificate\n• Top performer wins a camera\n\n💡 Would you like to explore our course offerings?`
      }
    ];

    for (const service of serviceMap) {
      if (service.keywords.some(kw => msg.includes(kw))) {
        return service.response;
      }
    }

    return null;
  }

  static _isOffTopic(msg) {
    const keywords = ["bts", "kpop", "ipl", "cricket", "movie", "actor", "singer", "song", "netflix", "prime", "football"];
    return keywords.some(kw => msg.includes(kw));
  }

  static _getOffTopicResponse() {
    return `⚠️ **Specialized Assistance Only**\n\nI'm a specialized AI assistant for Fotographiya - your premier wedding photography company. I can only help with topics related to our services.\n\n**Key Points:**\n• Wedding Photography\n• Pre-Wedding Photography\n• GoldenBox AI Technology\n• Fotographiya Academy\n\n💡 What would you like to know about Fotographiya?`;
  }

  static _getDefaultResponse() {
    return `📸 **Welcome to Fotographiya**\n\nI'm your professional AI photography assistant. I can provide information about our photography services, packages, GoldenBox technology, and academy.\n\n**Key Points:**\n• Wedding and Pre-Wedding Photography\n• Corporate and Event Photography\n• GoldenBox AI Technology\n• Fotographiya Academy\n\n💡 How can I assist you with Fotographiya today?`;
  }
}

// ============================================
// ✅ AI RESPONSE HANDLER - GROQ ONLY
// ============================================
class AIResponseHandler {
  async getAIResponse(userMessage, context) {
    const systemPrompt = PromptBuilder.buildSystemPrompt(context);
    const provider = new GroqProvider();

    try {
      const response = await provider.getResponse(userMessage, systemPrompt);
      if (response) {
        return ResponseFormatter.formatResponse(response);
      }
    } catch (error) {
      console.log(`⚠️ Groq failed:`, error.message);
    }

    // If Groq fails, fall back to static responses immediately
    console.log("⚠️ Provider failed, using fallback");
    return FallbackResponse.getResponse(userMessage);
  }
}

// ============================================
// ✅ EXPORTS
// ============================================
module.exports = {
  getAIResponse: (userMessage, context) => {
    const handler = new AIResponseHandler();
    return handler.getAIResponse(userMessage, context);
  }
};