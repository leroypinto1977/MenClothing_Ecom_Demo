export interface InfoSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface InfoPage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
  sections: InfoSection[];
}

export const infoPages: InfoPage[] = [
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    eyebrow: "Help",
    description:
      "Delivery options, timelines and our free 30-day returns policy.",
    intro:
      "We keep delivery simple and returns generous — wear it, live in it, and decide later.",
    sections: [
      {
        heading: "Delivery",
        body: [
          "Orders are dispatched within one business day from our London studio.",
        ],
        bullets: [
          "Standard (2–4 business days) — ₹600, complimentary over ₹12,000",
          "Express (1–2 business days) — ₹1,200",
          "Collect in store — free, ready in 2 hours",
        ],
      },
      {
        heading: "Returns",
        body: [
          "You have 30 days from delivery to return unworn items with tags attached. Returns are free — start one from your account and we'll send a prepaid label.",
          "Refunds land on the original payment method within 5–7 business days of the piece arriving back with us.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "Need a different size or colour? Place a new order for the piece you want and return the original — that way the right size isn't sold out by the time your return reaches us.",
        ],
      },
    ],
  },
  {
    slug: "size-guide",
    title: "Size Guide",
    eyebrow: "Help",
    description: "Find your size across shirts, knitwear, outerwear and trousers.",
    intro:
      "Our pieces are cut true to size. Between sizes? Size up for a relaxed drape, down for a closer line.",
    sections: [
      {
        heading: "Tops — chest (cm)",
        bullets: [
          "XS — 86–91",
          "S — 91–96",
          "M — 96–101",
          "L — 101–107",
          "XL — 107–114",
          "XXL — 114–122",
        ],
      },
      {
        heading: "Trousers — waist (inches)",
        bullets: ["28", "30", "32", "34", "36", "38"],
      },
      {
        heading: "Fits",
        bullets: [
          "Slim — close to the body without restricting movement",
          "Regular — our standard cut; easy through the chest and seat",
          "Relaxed — generous through the body with a fuller leg or sleeve",
          "Tailored — sharp through the shoulder and waist",
        ],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    eyebrow: "Help",
    description: "Get in touch with the MERIDIAN team.",
    intro:
      "Questions about an order, a fabric, or a fit — we read everything and reply within one business day.",
    sections: [
      {
        heading: "Customer care",
        bullets: [
          "Email — care@meridian.example.com",
          "Phone — +44 20 7946 0958, Mon–Fri, 9:00–18:00 GMT",
        ],
      },
      {
        heading: "Studio",
        body: ["18 Marylebone Lane, London W1U 2NB, United Kingdom."],
      },
      {
        heading: "Press & partnerships",
        body: ["For press, wholesale and collaboration enquiries: studio@meridian.example.com."],
      },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    eyebrow: "Help",
    description: "Answers to the questions we hear most often.",
    intro: "The short version of everything our customer care team gets asked.",
    sections: [
      {
        heading: "Where are your clothes made?",
        body: [
          "In small, family-run workshops across Portugal, Italy and Scotland — partners we visit regularly and have worked with for years.",
        ],
      },
      {
        heading: "When will my order arrive?",
        body: [
          "Standard delivery takes 2–4 business days; express takes 1–2. You'll get a tracking link the moment your order ships.",
        ],
      },
      {
        heading: "How do returns work?",
        body: [
          "Free within 30 days of delivery for unworn pieces with tags attached. Full details on the Shipping & Returns page.",
        ],
      },
      {
        heading: "Do you restock sold-out pieces?",
        body: [
          "Core essentials are restocked every season. Limited pieces are exactly that — once they're gone, they're gone.",
        ],
      },
    ],
  },
  {
    slug: "materials",
    title: "Materials",
    eyebrow: "Company",
    description: "The fibres and fabrics behind MERIDIAN essentials.",
    intro:
      "We start every piece with the fibre — natural materials chosen to feel good against the skin and improve with age.",
    sections: [
      {
        heading: "What we use",
        bullets: [
          "Extra-fine merino from Australian and New Zealand growers",
          "Organic long-staple cotton, GOTS-certified",
          "Belgian and Irish linen for warm-weather pieces",
          "Full-grain vegetable-tanned leather",
          "Waxed cotton from a century-old Scottish mill",
        ],
      },
      {
        heading: "What we avoid",
        body: [
          "Virgin synthetics, blended fibres that can't be recycled, and finishes that wash out after a season. 94% of the collection is natural fibre, and we're working on the rest.",
        ],
      },
    ],
  },
  {
    slug: "sustainability",
    title: "Sustainability",
    eyebrow: "Company",
    description: "Fewer, better things — and the practices behind them.",
    intro:
      "The most sustainable garment is the one you keep wearing. Everything we do starts from that idea.",
    sections: [
      {
        heading: "Made to be kept",
        body: [
          "We design against the seasonal churn of fashion — considered pieces meant to be repaired, re-worn and kept for years, not replaced.",
        ],
      },
      {
        heading: "Repairs, not replacements",
        body: [
          "Every MERIDIAN piece comes with access to our repair service. Loose seam, worn elbow, lost button — send it in and we'll mend it.",
        ],
      },
      {
        heading: "Carbon-neutral delivery",
        body: [
          "All deliveries are offset through verified reforestation projects, and our packaging is plastic-free and fully recyclable.",
        ],
      },
    ],
  },
  {
    slug: "stores",
    title: "Stores",
    eyebrow: "Company",
    description: "Visit MERIDIAN in person.",
    intro:
      "Try the fits, feel the fabrics, and talk to people who know the collection inside out.",
    sections: [
      {
        heading: "London — Marylebone",
        body: [
          "18 Marylebone Lane, W1U 2NB",
          "Mon–Sat 10:00–19:00 · Sun 11:00–17:00",
        ],
      },
      {
        heading: "Click & collect",
        body: [
          "Order online and collect in store within 2 hours, free of charge.",
        ],
      },
    ],
  },
  {
    slug: "careers",
    title: "Careers",
    eyebrow: "Company",
    description: "Join the MERIDIAN team.",
    intro:
      "We're a small team of makers, buyers and engineers who care about doing few things well.",
    sections: [
      {
        heading: "Open roles",
        body: [
          "We don't have any open positions right now, but we're always glad to hear from people who care about craft.",
        ],
      },
      {
        heading: "Speculative applications",
        body: [
          "Send a short note and your CV to careers@meridian.example.com — tell us what you'd want to make better.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    description: "How MERIDIAN handles your data.",
    intro:
      "The plain-English version: we collect only what we need to fulfil your order, and we never sell your data.",
    sections: [
      {
        heading: "What we collect",
        bullets: [
          "Contact and delivery details, to fulfil and deliver orders",
          "Order history, to handle returns and repairs",
          "Email address, only if you join The MERIDIAN List",
        ],
      },
      {
        heading: "What we don't do",
        body: [
          "We don't sell or rent your personal data, and we don't track you across other websites. Unsubscribe from marketing at any time with one click.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can request a copy of your data, or its deletion, at any time by writing to privacy@meridian.example.com.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    description: "The terms that govern your use of the MERIDIAN store.",
    intro:
      "By placing an order you agree to these terms. This is a demonstration store — no real orders are fulfilled.",
    sections: [
      {
        heading: "Orders & payment",
        body: [
          "All prices include GST. An order is confirmed once payment is authorised and you receive a confirmation email.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "Returns are accepted within 30 days of delivery as described on the Shipping & Returns page.",
        ],
      },
      {
        heading: "Demo notice",
        body: [
          "MERIDIAN is a demonstration storefront. Products, prices, reviews and policies are illustrative only.",
        ],
      },
    ],
  },
];

export function getInfoPage(slug: string) {
  return infoPages.find((p) => p.slug === slug);
}
