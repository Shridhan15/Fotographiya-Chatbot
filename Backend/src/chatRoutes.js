const express = require('express');
const router = express.Router();
const { getAIResponse } = require('./services/aiService');
const scraperService = require('./services/scraperService');

// ============================================
// ✅ OFF-TOPIC KEYWORDS CHECK
// ============================================
const OFF_TOPIC_KEYWORDS = [
  'bts', 'kpop', 'ipl', 'cricket', 'movie', 'actor', 'singer', 'song',
  'netflix', 'prime', 'hotstar', 'football', 'prime minister', 'president',
  'modi', 'trump', 'china', 'pakistan', 'usa', 'uk', 'russia',
  'anime', 'manga', 'game of thrones', 'marvel', 'dc', 'hollywood',
  'bollywood', 'tiktok', 'instagram influencer'
];

function isOffTopic(message) {
  const msg = message.toLowerCase();
  return OFF_TOPIC_KEYWORDS.some(keyword => msg.includes(keyword));
}

// ============================================
// ✅ INTERNATIONAL KEYWORDS CHECK
// ============================================
const INTERNATIONAL_KEYWORDS = [
  'bali', 'maldives', 'thailand', 'dubai', 'uae', 'usa', 'uk', 'europe',
  'america', 'canada', 'australia', 'singapore', 'malaysia', 'international',
  'outside india', 'abroad', 'foreign', 'overseas', 'international wedding',
  'shoot outside india', 'photography outside india', 'do you shoot outside',
  'outside country', 'foreign country', 'other country'
];

function isInternationalQuestion(message) {
  const msg = message.toLowerCase();
  return INTERNATIONAL_KEYWORDS.some(keyword => msg.includes(keyword));
}

// ============================================
// ✅ CHAT MESSAGE ROUTE - ONLY ONE!
// ============================================
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`📩 Message: ${message}`);

    // 🔥 STEP 1: Check if it's about international services
    if (isInternationalQuestion(message)) {
      return res.json({
        success: true,
        data: {
          message: "❌ **No International Services**\n\nWe only operate within India. We do not provide photography services outside India.\n\n📍 **Our Coverage:** All Indian states including Rajasthan, Goa, Kerala, Himachal Pradesh, and more.\n\n💡 Would you like to know about our Indian destination wedding packages?",
          timestamp: new Date().toISOString()
        }
      });
    }

    // 🔥 STEP 2: Check if it's an off-topic question
    if (isOffTopic(message)) {
      return res.json({
        success: true,
        data: {
          message: "I can only help with questions about Fotographiya, our photography services, packages, GoldenBox, academy, and portfolio. What would you like to know about Fotographiya?",
          timestamp: new Date().toISOString()
        }
      });
    }

    // 🔥 STEP 3: Get AI response
    const context = scraperService.buildContextForAI(message);
    const reply = await getAIResponse(message, context);

    res.json({
      success: true,
      data: {
        message: reply,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your request.'
    });
  }
});

module.exports = router;