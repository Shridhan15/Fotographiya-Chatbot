// ============================================
// ✅ FOTOGRAFIYA COMPANY DATA
// ============================================
// This file contains all company information used by
// aiService.js for fallback responses and context building.

const companyData = {
  company: {
    name: "Fotographiya",
    tagline: "Integrating technology in the art of wedding photography",
    description: "Fotographiya is a premium wedding photography and cinematography company based in Kota, Rajasthan, India. We blend traditional artistry with modern technology to create timeless memories.",
    location: "Kota, Rajasthan, India",
    officeAddress: "Kota, Rajasthan",
    phone: "+91 9001110144",
    email: "fotographiyaworld@gmail.com",
    website: "https://www.fotographiya.com",
    whatsapp: "https://api.whatsapp.com/send/?phone=9001110144",
    founder: "Mohit Barthunia",
    established: "2023",
    rating: "4.6/5",
    customers: "100+ Happy Couples"
  },

  team: {
    total: "50+",
    description: "Fotographiya has a team of 50+ dedicated professionals across multiple departments, working together to deliver exceptional photography services.",
    roles: [
      "Founder & CEO",
      "Lead Photographer",
      "Cinematographer",
      "Drone Operator",
      "Photo Editor",
      "Video Editor",
      "Album Designer",
      "Software Developer",
      "AI Engineer",
      "Sales Manager",
      "Digital Marketing Manager",
      "Customer Relations"
    ]
  },

  socialMedia: {
    instagram: {
      platform: "Instagram",
      url: "https://www.instagram.com/fotographiya_official/"
    },
    facebook: {
      platform: "Facebook",
      url: "https://www.facebook.com/people/Fotographiya-Wedphotography/100092454265642/"
    },
    youtube: {
      platform: "YouTube",
      url: "https://www.youtube.com/@Fotographiya_official"
    },
    linkedin: {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/company/fotographiya"
    },
    reddit: {
      platform: "Reddit",
      url: "https://www.reddit.com/r/fotographiya"
    },
    medium: {
      platform: "Medium",
      url: "https://medium.com/@fotographiya"
    },
    pexels: {
      platform: "Pexels",
      url: "https://www.pexels.com/@fotographiya"
    }
  },

  pages: {
    home: "https://www.fotographiya.com",
    about: "https://www.fotographiya.com/about",
    services: "https://www.fotographiya.com/services",
    wedding: "https://www.fotographiya.com/services/wedding-photography",
    prewedding: "https://www.fotographiya.com/services/prewedding-photography",
    destination: "https://www.fotographiya.com/services/destination-wedding",
    anniversary: "https://www.fotographiya.com/services/anniversary-photography",
    corporate: "https://www.fotographiya.com/services/corporate-photography",
    academy: "https://www.fotographiya.com/fotographiya-academy",
    portfolio: "https://www.fotographiya.com/portfolio",
    contact: "https://www.fotographiya.com/contact",
    maternity: "https://www.fotographiya.com/services/maternity-photography",
    birthday: "https://www.fotographiya.com/services/birthday-photography",
    roka: "https://www.fotographiya.com/services/roka-photography"
  },

  links: [
    "https://www.fotographiya.com",
    "https://www.fotographiya.com/about",
    "https://www.fotographiya.com/services",
    "https://www.fotographiya.com/services/wedding-photography",
    "https://www.fotographiya.com/services/prewedding-photography",
    "https://www.fotographiya.com/services/destination-wedding",
    "https://www.fotographiya.com/services/corporate-photography",
    "https://www.fotographiya.com/fotographiya-academy",
    "https://www.fotographiya.com/portfolio",
    "https://www.fotographiya.com/contact"
  ],

  services: {
    wedding: {
      description: "We provide comprehensive wedding photography covering all ceremonies - from pre-wedding rituals to the reception, with professional editing and creative storytelling."
    },
    prewedding: {
      description: "We offer professional pre-wedding photography services for couples. Our team captures romantic moments at scenic locations with expert editing and creative direction."
    },
    destination: {
      description: "We offer professional destination wedding photography services across India. Our team covers all major Indian destinations including Rajasthan, Goa, Kerala, and Himachal Pradesh."
    },
    corporate: {
      description: "Professional corporate photography services for events, conferences, team photos, and brand imagery."
    },
    maternity: {
    description: "Professional maternity photography celebrating the beauty of pregnancy. We capture the glow, the love, and the anticipation of expecting mothers."
  },
  birthday: {
    description: "Professional birthday photography capturing the joy, laughter, and love of your special day from cake smash to celebration."
  },
  roka: {
    description: "Professional Roka ceremony photography capturing every ritual, emotion, and sacred moment of this cherished pre-wedding tradition."
  }
  },

  packages: {
    silver: {
      name: "Silver Package",
      includes: "Basic wedding coverage with professional photography, edited digital photos, and online gallery."
    },
    golden: {
      name: "Golden Package",
      includes: "Comprehensive wedding coverage with photography and cinematography, professional editing, album, and online gallery."
    },
    premium: {
      name: "Premium Package",
      includes: "Premium wedding coverage with photography, cinematography, drone shots, premium album, and all digital assets."
    }
  },

  goldenBox: {
    description: "GoldenBox is our innovative AI-powered system that delivers high-quality event photos instantly to attendees without requiring internet or app downloads.",
    features: [
      "No internet required",
      "No app download needed",
      "3-second instant download",
      "AI-enhanced premium quality",
      "QR code based delivery",
      "Real-time photo processing"
    ],
    aiPowered: "AI-powered facial recognition and photo enhancement for instant delivery of premium quality photos.",
    steps: {
      capture: "Capture",
      processing: "AI Processing",
      qrDisplay: "QR Display",
      download: "Download"
    }
  },

  academy: {
    tagline: "Not a Course. A Career. Launchpad.",
    description: "Fotographiya Academy offers professional photography and videography courses with paid internships and industry-recognized certification.",
    courses: [
      "Professional Photography",
      "Cinematography & Videography",
      "Photo Editing & Retouching",
      "Video Editing & Post-Production",
      "Drone Photography",
      "Lighting & Studio Setup",
      "Wedding Photography Masterclass",
      "Business of Photography"
    ]
  },

  portfolio: {
    description: "Our portfolio showcases 100+ weddings and events we've captured with creativity, passion, and professional excellence.",
    couplesCount: "100+"
  },

  keywords: {
    international: [
      'international', 'outside india', 'abroad', 'foreign', 'overseas',
      'bali', 'maldives', 'thailand', 'dubai', 'uae', 'usa', 'uk', 
      'europe', 'america', 'canada', 'australia', 'singapore', 'malaysia'
    ]
  }
};

module.exports = companyData;