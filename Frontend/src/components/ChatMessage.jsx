// ChatMessage.jsx - COMPLETE REPLACEMENT

import React from "react";
import ReactMarkdown from "react-markdown";
import "../styles/ChatBot.css";

// ============================================
// ✅ MASTER KEYWORD TO LINK MAPPING
// ============================================

const LINK_CONFIG = {
  // 📌 SOCIAL MEDIA - Individual
  instagram: {
    keywords: ["instagram", "insta", "ig"],
    link: "https://www.instagram.com/fotographiya_official/",
    label: "Instagram",
    icon: "📸",
  },
  facebook: {
    keywords: ["facebook", "fb"],
    link: "https://www.facebook.com/people/Fotographiya-Wedphotography/100092454265642/",
    label: "Facebook",
    icon: "📘",
  },
  youtube: {
    keywords: ["youtube", "yt"],
    link: "https://www.youtube.com/@Fotographiya_official",
    label: "YouTube",
    icon: "🎬",
  },
  linkedin: {
    keywords: ["linkedin"],
    link: "https://www.linkedin.com/company/fotographiya",
    label: "LinkedIn",
    icon: "💼",
  },

  // 📌 SOCIAL MEDIA - All (Group)
  allSocial: {
    keywords: [
      "social media",
      "social accounts",
      "all social",
      "social platforms",
    ],
    links: [
      {
        label: "Instagram",
        link: "https://www.instagram.com/fotographiya_official/",
        icon: "📸",
      },
      {
        label: "Facebook",
        link: "https://www.facebook.com/people/Fotographiya-Wedphotography/100092454265642/",
        icon: "📘",
      },
      {
        label: "YouTube",
        link: "https://www.youtube.com/@Fotographiya_official",
        icon: "🎬",
      },
      {
        label: "LinkedIn",
        link: "https://www.linkedin.com/company/fotographiya",
        icon: "💼",
      },
    ],
  },

  // 📌 SERVICES - EXACT WORD MATCH
  maternity: {
    keywords: ["maternity", "pregnancy", "baby bump", "motherhood"],
    link: "https://www.fotographiya.com/services/maternity-photography",
    label: "Maternity Photography",
    icon: "👶",
  },
  prewedding: {
    keywords: ["pre wedding", "prewedding", "pre-wedding", "engagement"],
    link: "https://www.fotographiya.com/services/prewedding-photography",
    label: "Pre-Wedding Photography",
    icon: "📸",
  },
  wedding: {
    keywords: ["wedding", "marriage", "shaadi"],
    link: "https://www.fotographiya.com/services/wedding-photography",
    label: "Wedding Photography",
    icon: "💍",
  },
  destination: {
    keywords: ["destination wedding", "destination"],
    link: "https://www.fotographiya.com/services/destination-wedding",
    label: "Destination Wedding",
    icon: "🏖️",
  },
  birthday: {
    keywords: ["birthday", "cake smash", "kids birthday"],
    link: "https://www.fotographiya.com/services/birthday-photography",
    label: "Birthday Photography",
    icon: "🎂",
  },
  roka: {
    keywords: ["roka", "tilak", "ring ceremony"],
    link: "https://www.fotographiya.com/services/roka-photography",
    label: "Roka Ceremony",
    icon: "💍",
  },
  corporate: {
    keywords: ["corporate", "event"],
    link: "https://www.fotographiya.com/services/corporate-photography",
    label: "Corporate Photography",
    icon: "🏢",
  },

  // 📌 PACKAGES
  silver: {
    keywords: ["silver package", "silver pack"],
    link: "https://www.fotographiya.com/packages/silver",
    label: "Silver Package",
    icon: "🥈",
  },
  golden: {
    keywords: ["golden package", "golden pack"],
    link: "https://www.fotographiya.com/packages/golden",
    label: "Golden Package",
    icon: "🥇",
  },
  premium: {
    keywords: ["premium package", "premium pack"],
    link: "https://www.fotographiya.com/packages/premium",
    label: "Premium Package",
    icon: "💎",
  },
  allPackages: {
    keywords: ["packages", "pricing", "budget", "cost", "price"],
    links: [
      {
        label: "🥈 Silver Package",
        link: "https://www.fotographiya.com/packages/silver",
      },
      {
        label: "🥇 Golden Package",
        link: "https://www.fotographiya.com/packages/golden",
      },
      {
        label: "💎 Premium Package",
        link: "https://www.fotographiya.com/packages/premium",
      },
    ],
  },

  // 📌 CONTACT - ONLY WHEN "CONTACT" WORD IS USED
  contact: {
    keywords: [
      "contact",
      "contact us",
      "reach us",
      "help",
      "support",
      "customer care",
    ],
    links: [
      { label: "📞 Call Us", link: "tel:+919001110144" },
      { label: "💬 WhatsApp", link: "https://wa.me/919001110144" },
      { label: "📧 Email", link: "mailto:fotographiyaworld@gmail.com" },
      {
        label: "📝 Contact Page",
        link: "https://www.fotographiya.com/contact",
      },
    ],
  },

  // 📌 LOCATION - ONLY MAP
  location: {
    keywords: ["location", "address", "studio", "kota", "rajasthan"],
    link: "https://maps.google.com/?q=Kota,Rajasthan",
    label: "Google Maps",
    icon: "📍",
  },

  // 📌 OTHER PAGES
  about: {
    keywords: ["about us", "about", "founder", "history"],
    link: "https://www.fotographiya.com/about",
    label: "About Us",
    icon: "📖",
  },
  goldenbox: {
    keywords: ["golden box", "goldenbox", "qr photo"],
    link: "https://www.fotographiya.com/goldenbox",
    label: "GoldenBox",
    icon: "✨",
  },
  academy: {
    keywords: ["academy", "course", "training", "internship"],
    link: "https://www.fotographiya.com/fotographiya-academy",
    label: "Fotographiya Academy",
    icon: "🎓",
  },
  portfolio: {
    keywords: ["portfolio", "gallery", "work samples"],
    link: "https://www.fotographiya.com/portfolio",
    label: "Portfolio",
    icon: "🖼️",
  },
};

// ============================================
// ✅ SMART WORD MATCHING FUNCTION
// ============================================

function findMatchingLinks(userMessage) {
  if (!userMessage) return null;

  const lowerText = userMessage.toLowerCase().trim();
  const matches = [];
  const matchedWords = new Set();

  // 🔥 STEP 1: Check each word/phrase in the message
  for (const [key, config] of Object.entries(LINK_CONFIG)) {
    let isMatch = false;
    let matchedKeyword = "";

    for (const keyword of config.keywords) {
      const kwLower = keyword.toLowerCase();

      // ✅ Check if keyword exists as a WHOLE WORD in the message
      // Using word boundaries - matches "maternity" in "do you shoot maternity?"
      const wordRegex = new RegExp(
        `\\b${kwLower.replace(/\s+/g, "\\s+")}\\b`,
        "i",
      );

      if (wordRegex.test(lowerText)) {
        isMatch = true;
        matchedKeyword = keyword;
        break;
      }

      // ✅ Also check if message starts with the keyword
      if (lowerText.startsWith(kwLower)) {
        isMatch = true;
        matchedKeyword = keyword;
        break;
      }

      // ✅ Check if message ends with the keyword
      if (lowerText.endsWith(kwLower)) {
        isMatch = true;
        matchedKeyword = keyword;
        break;
      }
    }

    if (isMatch) {
      matchedWords.add(key);

      if (config.links) {
        matches.push({
          type: "multiple",
          links: config.links,
          key: key,
        });
      } else if (config.link) {
        matches.push({
          type: "single",
          label: config.label,
          link: config.link,
          icon: config.icon || "🔗",
          key: key,
        });
      }
    }
  }

  // 🔥 STEP 2: Remove duplicates and overlapping matches
  // Example: If "pre wedding" matched, remove "wedding" match
  const finalMatches = [];
  const matchedKeys = new Set();

  // Sort: Longer keywords first (pre wedding > wedding)
  matches.sort((a, b) => {
    const aLen = a.key ? a.key.length : 0;
    const bLen = b.key ? b.key.length : 0;
    return bLen - aLen;
  });

  for (const match of matches) {
    const key = match.key || "";

    // Check if this key is already covered by a longer match
    let isCovered = false;
    for (const existingKey of matchedKeys) {
      // If existing key is "prewedding" and current is "wedding" - skip current
      if (existingKey.includes(key) && existingKey !== key) {
        isCovered = true;
        break;
      }
      // If existing key is "wedding" and current is "prewedding" - keep both (different services)
    }

    if (!isCovered) {
      matchedKeys.add(key);
      finalMatches.push(match);
    }
  }

  // 🔥 STEP 3: Special case - if "maternity" matched, remove "wedding" if both are there
  // But keep both if user asked about both
  const hasMaternity = finalMatches.some((m) => m.key === "maternity");
  const hasWedding = finalMatches.some((m) => m.key === "wedding");
  const hasPrewedding = finalMatches.some((m) => m.key === "prewedding");

  // If user has "maternity" and "wedding" both, keep both
  // If user has "prewedding", remove "wedding" (because prewedding is more specific)
  if (hasPrewedding && hasWedding) {
    const filtered = finalMatches.filter((m) => m.key !== "wedding");
    return filtered.length > 0 ? filtered : null;
  }

  return finalMatches.length > 0 ? finalMatches : null;
}

// ============================================
// ✅ LinkButton
// ============================================

const LinkButton = ({ href, text }) => {
  let validHref = href;

  if (!validHref) {
    validHref = "https://www.fotographiya.com/contact";
  } else if (
    !validHref.startsWith("http") &&
    !validHref.startsWith("tel:") &&
    !validHref.startsWith("mailto:") &&
    !validHref.startsWith("#")
  ) {
    validHref = `https://${validHref}`;
  }

  return (
    <a
      href={validHref}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-inline-link"
    >
      {text}
    </a>
  );
};

// ============================================
// ✅ parseMessage
// ============================================

const parseMessage = (text) => {
  if (!text) return [{ type: "text", content: text || "" }];

  const segments = [];
  let remaining = text;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const linkMatches = [];
  let linkMatch;

  while ((linkMatch = linkRegex.exec(remaining)) !== null) {
    linkMatches.push({
      text: linkMatch[1],
      url: linkMatch[2],
      index: linkMatch.index,
      fullMatch: linkMatch[0],
    });
  }

  if (linkMatches.length === 0) {
    return [{ type: "text", content: text }];
  }

  let lastIndex = 0;
  for (const match of linkMatches) {
    if (match.index > lastIndex) {
      const textBefore = remaining.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        segments.push({ type: "text", content: textBefore });
      }
    }
    segments.push({
      type: "link",
      text: match.text,
      href: match.url,
    });
    lastIndex = match.index + match.fullMatch.length;
  }

  if (lastIndex < remaining.length) {
    const remainingText = remaining.slice(lastIndex);
    if (remainingText.trim()) {
      segments.push({ type: "text", content: remainingText });
    }
  }

  const groupedSegments = [];
  let currentGroup = [];

  for (const segment of segments) {
    if (segment.type === "link") {
      currentGroup.push(segment);
    } else {
      if (currentGroup.length > 0) {
        groupedSegments.push({
          type: "linkGroup",
          links: [...currentGroup],
        });
        currentGroup = [];
      }
      groupedSegments.push(segment);
    }
  }

  if (currentGroup.length > 0) {
    groupedSegments.push({
      type: "linkGroup",
      links: [...currentGroup],
    });
  }

  return groupedSegments;
};

// ============================================
// ✅ markdownComponents - NO STARS
// ============================================

const markdownComponents = {
  a: ({ href, children }) => (
    <span className="markdown-link-wrapper">
      <LinkButton href={href} text={children} />
    </span>
  ),
  p: ({ children }) => <p className="message-text">{children}</p>,
  strong: ({ children }) => <strong className="chat-bold">{children}</strong>,
  ul: ({ children }) => <ul className="chat-list">{children}</ul>,
  li: ({ children }) => <li className="chat-list-item">• {children}</li>,
};

// ============================================
// ✅ MAIN: ChatMessage Component
// ============================================

const ChatMessage = ({ message, lastUserMessage }) => {
  const isBot = message.sender === "bot";
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ===== USER MESSAGE =====
  if (!isBot) {
    return (
      <div className="message-wrapper user">
        <div className="message-avatar">
          <div className="user-avatar">👤</div>
        </div>
        <div className="message-content">
          <div className="message-bubble user-bubble">
            <p className="message-text">{message.text}</p>
          </div>
          <span className="message-time">{time}</span>
        </div>
      </div>
    );
  }

  // ===== BOT MESSAGE =====

  // ✅ STEP 1: Sirf user ke last message ke hisaab se links dhoondo
  // ✅ BULLETPROOF FIX: Lock the links in React State so they NEVER disappear!
  // This forces the bubble to memorize its buttons on day one and ignore all future messages.
  const [keywordLinks] = React.useState(() => {
    return lastUserMessage ? findMatchingLinks(lastUserMessage) : null;
  });

  // ✅ STEP 2: Agar keyword match hai toh AI answer + Links
  if (keywordLinks && keywordLinks.length > 0) {
    return (
      <div className="message-wrapper bot">
        <div className="message-avatar">
          <img
            src="/src/assets/logo/logo.jpeg"
            alt="Bot"
            className="avatar-img"
          />
        </div>
        <div className="message-content">
          <div className="message-bubble bot-bubble">
            {/* AI ka answer - WITHOUT STARS */}
            <ReactMarkdown components={markdownComponents}>
              {message.text || ""}
            </ReactMarkdown>

            {/* Links - Sirf user ke keyword ke hisaab se */}
            {keywordLinks.map((linkGroup, index) => {
              if (linkGroup.type === "multiple") {
                return (
                  <div key={index} className="link-container">
                    {linkGroup.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-inline-link"
                      >
                        {link.icon || "🔗"} {link.label}
                      </a>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div key={index} className="link-container">
                    <a
                      href={linkGroup.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-inline-link"
                    >
                      {linkGroup.icon} {linkGroup.label}
                    </a>
                  </div>
                );
              }
            })}
          </div>
          <span className="message-time">{time}</span>
        </div>
      </div>
    );
  }

  // ✅ STEP 3: No keyword match - Sirf AI ka answer (no links)
  return (
    <div className="message-wrapper bot">
      <div className="message-avatar">
        <img
          src="/src/assets/logo/logo.jpeg"
          alt="Bot"
          className="avatar-img"
        />
      </div>
      <div className="message-content">
        <div className="message-bubble bot-bubble">
          <ReactMarkdown components={markdownComponents}>
            {message.text || ""}
          </ReactMarkdown>
        </div>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
