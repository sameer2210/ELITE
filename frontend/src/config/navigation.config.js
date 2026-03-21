export const NAV_ORDER = [
  "explore",
  "awards",
  "developers",
  "collections",
  "technologies",
  "community",
  "blog",
  "submit",
];

export const NAVIGATION = {
  explore: {
    label: "Explore",
    path: "/explore",
    mega: {
      featured: {
        title: "Featured Projects",
        items: [
          "Aperture Studio",
          "Nebula Labs",
          "Cobalt Design",
          "Atlas Portfolio",
        ],
      },
      categories: {
        "Trending Websites": {
          items: ["Immersive 3D", "Experimental UI", "Case Studies", "Startup Launches"],
        },
        "Most Viewed": {
          items: ["Developer Tools", "Agency Showcases", "Creative Portfolios", "Productive SaaS"],
        },
        "Recently Submitted": {
          items: ["Weekend Builds", "Hackathon Winners", "Indie Projects", "Client Work"],
        },
        "Staff Picks": {
          items: ["Motion Experiments", "Minimalist UI", "Editorial Sites", "Interactive Stories"],
        },
      },
      spotlight: {
        title: "Project Spotlight",
        image: "/api/placeholder/300/400",
        brand: "Lumen Studio",
        description: "Cinematic WebGL experience crafted with Three.js and GSAP.",
        cta: "VIEW CASE STUDY",
        link: "/projects/lumen-studio",
      },
    },
    mobile: {
      items: [
        { label: "Trending Websites", path: "/explore/trending" },
        { label: "Featured Projects", path: "/explore/featured" },
        { label: "Most Viewed", path: "/explore/most-viewed" },
        { label: "Recently Submitted", path: "/explore/recent" },
        { label: "Staff Picks", path: "/explore/staff-picks" },
      ],
    },
  },
  awards: {
    label: "Awards",
    path: "/awards",
    mega: {
      featured: {
        title: "Award Tracks",
        items: [
          "Honor Mentions",
          "Nominees",
          "Sites of the Day",
          "Sites of the Month",
          "Sites of the Year",
        ],
      },
      categories: {
        Recognition: {
          items: ["Most Awarded Developers", "Rising Stars", "Agency of the Year"],
        },
        "Jury Panel": {
          items: ["Meet the Jury", "Become a Judge"],
        },
      },
      spotlight: {
        title: "Award Spotlight",
        image: "/api/placeholder/300/400",
        brand: "Site of the Year 2026",
        description: "The most celebrated digital experience of the year.",
        cta: "SEE WINNER",
        link: "/awards/site-of-the-year",
      },
    },
    mobile: {
      items: [
        { label: "Honor Mentions", path: "/awards/honorable-mentions" },
        { label: "Nominees", path: "/awards/nominees" },
        { label: "Sites of the Day", path: "/awards/sotd" },
        { label: "Sites of the Month", path: "/awards/sotm" },
        { label: "Sites of the Year", path: "/awards/soty" },
        { label: "Most Awarded Developers", path: "/awards/most-awarded" },
        { label: "Jury Panel", path: "/awards/jury" },
      ],
    },
  },
  developers: {
    label: "Developers",
    path: "/developers",
    mega: {
      featured: {
        title: "Top Developers",
        items: ["Top Developers", "Rising Developers", "Most Awarded Profiles"],
      },
      categories: {
        "Work Style": {
          items: ["Freelancers", "Agencies", "Studios"],
        },
        Discovery: {
          items: ["New Profiles", "Available Now", "Remote Teams"],
        },
      },
      spotlight: {
        title: "Developer of the Month",
        image: "/api/placeholder/300/400",
        brand: "Harper Creative",
        description: "Award-winning interactive experiences for global brands.",
        cta: "VIEW PROFILE",
        link: "/developers/harper-creative",
      },
    },
    mobile: {
      items: [
        { label: "Top Developers", path: "/developers/top" },
        { label: "Rising Developers", path: "/developers/rising" },
        { label: "Most Awarded Profiles", path: "/developers/awarded" },
        { label: "Freelancers", path: "/developers/freelancers" },
        { label: "Agencies", path: "/developers/agencies" },
      ],
    },
  },
  collections: {
    label: "Collections",
    path: "/collections",
    mega: {
      featured: {
        title: "Curated Lists",
        items: ["Best Landing Pages", "Best UI Design", "Best Animations"],
      },
      categories: {
        "Best of": {
          items: ["Best SaaS Websites", "Best Portfolio Websites", "Best Ecommerce Experiences"],
        },
        Inspiration: {
          items: ["Minimalist Interfaces", "Bold Typography", "Microinteractions"],
        },
      },
      spotlight: {
        title: "Collection Spotlight",
        image: "/api/placeholder/300/400",
        brand: "SaaS Launch Packs",
        description: "High-converting landing pages for project teams.",
        cta: "BROWSE COLLECTION",
        link: "/collections/saas",
      },
    },
    mobile: {
      items: [
        { label: "Best Landing Pages", path: "/collections/landing-pages" },
        { label: "Best UI Design", path: "/collections/ui-design" },
        { label: "Best Animations", path: "/collections/animations" },
        { label: "Best SaaS Websites", path: "/collections/saas" },
        { label: "Best Portfolio Websites", path: "/collections/portfolios" },
      ],
    },
  },
  technologies: {
    label: "Technologies",
    path: "/technologies",
    mega: {
      featured: {
        title: "Popular Stacks",
        items: ["React", "Next.js", "Vue", "Node.js"],
      },
      categories: {
        "3D & Motion": {
          items: ["Three.js", "WebGL", "GSAP", "Spline"],
        },
        "UI & Styling": {
          items: ["TailwindCSS", "Framer Motion", "Design Systems", "CSS Art"],
        },
        "Backend & AI": {
          items: ["Serverless", "AI Websites", "Edge Functions", "LLMs"],
        },
      },
      spotlight: {
        title: "Tech Spotlight",
        image: "/api/placeholder/300/400",
        brand: "AI Websites",
        description: "Projects built with generative AI workflows and tooling.",
        cta: "EXPLORE AI",
        link: "/technologies/ai",
      },
    },
    mobile: {
      items: [
        { label: "React", path: "/technologies/react" },
        { label: "Next.js", path: "/technologies/nextjs" },
        { label: "Vue", path: "/technologies/vue" },
        { label: "Three.js", path: "/technologies/threejs" },
        { label: "WebGL", path: "/technologies/webgl" },
        { label: "GSAP", path: "/technologies/gsap" },
        { label: "TailwindCSS", path: "/technologies/tailwind" },
        { label: "Node.js", path: "/technologies/node" },
        { label: "AI Websites", path: "/technologies/ai" },
      ],
    },
  },
  community: {
    label: "Community",
    path: "/community",
    mega: null,
    mobile: {
      items: [
        { label: "Forums", path: "/community/forums" },
        { label: "Events", path: "/community/events" },
        { label: "Jobs", path: "/community/jobs" },
        { label: "Client Requests", path: "/community/clients" },
      ],
    },
  },
  blog: {
    label: "Blog",
    path: "/blog",
    mega: null,
    mobile: {
      items: [
        { label: "Latest", path: "/blog" },
        { label: "Tutorials", path: "/blog/tutorials" },
        { label: "Interviews", path: "/blog/interviews" },
      ],
    },
  },
  submit: {
    label: "Projects",
    path: "/projects",
    mega: null,
    mobile: {
      items: [],
    },
  },
};

export const SEARCH_SUGGESTIONS = [
  "Portfolio",
  "SaaS",
  "Landing Page",
  "3D",
  "AI",
  "WebGL",
  "Agency",
];
