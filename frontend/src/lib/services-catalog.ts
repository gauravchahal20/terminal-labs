export interface ServiceMeta {
  key: string;
  name: string;
  category: "Development" | "Artificial Intelligence" | "Automation" | "Marketing" | "Creative Content" | "Data & Insights" | "Community" | "Infrastructure" | "Design";
  tagline: string;
  description: string;
  url: string;
  sub_capabilities: string[];
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const TERMINAL_LABS_SERVICES: Record<string, ServiceMeta> = {
  "Web Design & Development": {
    key: "Web Design & Development",
    name: "Web Design & Development",
    category: "Development",
    tagline: "Build a Website That Works as Hard as You Do",
    description: "Modern, responsive, and high-performing websites combining editorial design with seamless functionality.",
    url: "https://labs-terminal.vercel.app/services/web-development",
    sub_capabilities: ["Business Websites", "Landing Pages", "E-Commerce Stores", "Custom Web Applications"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "Mobile App Development": {
    key: "Mobile App Development",
    name: "Mobile App Development",
    category: "Development",
    tagline: "Powerful Mobile Experiences Built for Modern Businesses",
    description: "Intuitive, secure, and cross-platform mobile apps for Android & iOS built for long-term growth.",
    url: "https://labs-terminal.vercel.app/services/mobile-app-development",
    sub_capabilities: ["Android Development", "iOS Development", "Cross Platform Apps", "Backend Integration"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "AI Agents": {
    key: "AI Agents",
    name: "AI Agents",
    category: "Artificial Intelligence",
    tagline: "Intelligent AI Solutions That Save Time and Improve Productivity",
    description: "Automate conversations, simplify operations, and assist your team around the clock with faster customer experiences.",
    url: "https://labs-terminal.vercel.app/services/ai-agents",
    sub_capabilities: ["AI Chatbots", "AI Assistants", "Custom Knowledge Bases", "Customer Support"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "WhatsApp Business Automation": {
    key: "WhatsApp Business Automation",
    name: "WhatsApp Business Automation",
    category: "Automation",
    tagline: "Transform Customer Conversations Into Business Opportunities",
    description: "Respond instantly, automate support, nurture leads, and simplify communication on WhatsApp.",
    url: "https://labs-terminal.vercel.app/services/whatsapp-automation",
    sub_capabilities: ["WhatsApp Business API", "AI Chatbots", "Automated Replies", "Broadcast Campaigns"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "Social Media Management": {
    key: "Social Media Management",
    name: "Social Media Management",
    category: "Marketing",
    tagline: "Build a Brand People Recognize and Trust",
    description: "Stay connected with customers and reach new audiences with compelling content and community management.",
    url: "https://labs-terminal.vercel.app/services/social-media-management",
    sub_capabilities: ["Content Planning", "Creative Design", "Copywriting", "Scheduling"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECة]"
  },
  "Video Editing & Production": {
    key: "Video Editing & Production",
    name: "Video Editing & Production",
    category: "Creative Content",
    tagline: "Create Content That Captures Attention and Inspires Action",
    description: "High-quality video assets that tell your story, promote your brand, and maximize audience reach.",
    url: "https://labs-terminal.vercel.app/services/video-editing-production",
    sub_capabilities: ["Promotional Videos", "Reels & Shorts", "Motion Graphics", "Sound Design"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECF]"
  },
  "Data Analytics & Visualization": {
    key: "Data Analytics & Visualization",
    name: "Data Analytics & Visualization",
    category: "Data & Insights",
    tagline: "Turn Raw Data Into Valuable Business Insights",
    description: "Organize, analyze, and visualize information through interactive dashboards and executive KPI reports.",
    url: "https://labs-terminal.vercel.app/services/data-analytics-visualization",
    sub_capabilities: ["Interactive Dashboards", "Business Intelligence", "Data Visualization", "KPI Reporting"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "Ads & Content Creation": {
    key: "Ads & Content Creation",
    name: "Ads & Content Creation",
    category: "Marketing",
    tagline: "Reach the Right Audience With Content That Converts",
    description: "Persuasive ad campaigns and high-converting creative designed to attract qualified leads with high ROAS.",
    url: "https://labs-terminal.vercel.app/services/ads-content-creation",
    sub_capabilities: ["Google Ads", "Meta Ads", "Content Creation", "Creative Design"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECF]"
  },
  "Automation Workflows": {
    key: "Automation Workflows",
    name: "Automation Workflows",
    category: "Automation",
    tagline: "Streamline Your Operations With Smart Automation",
    description: "Eliminate repetitive tasks and connect your business tools through intelligent API pipelines.",
    url: "https://labs-terminal.vercel.app/services/automation-workflows",
    sub_capabilities: ["Workflow Automation", "API Integration", "Zapier Automation", "Make Automation"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "Search Engine Optimization (SEO)": {
    key: "Search Engine Optimization (SEO)",
    name: "Search Engine Optimization (SEO)",
    category: "Marketing",
    tagline: "Increase Your Visibility and Attract More Organic Traffic",
    description: "Improve search engine rankings and attract compounding high-intent organic buyer traffic.",
    url: "https://labs-terminal.vercel.app/services/seo-search-engine-optimization",
    sub_capabilities: ["Technical SEO", "On Page SEO", "Keyword Research", "Content Optimization"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECF]"
  },
  "Copywriting & Ghostwriting": {
    key: "Copywriting & Ghostwriting",
    name: "Copywriting & Ghostwriting",
    category: "Creative Content",
    tagline: "Words That Build Trust and Drive Action",
    description: "High-converting sales copy, blogs, articles, and executive ghostwriting that communicates brand authority.",
    url: "https://labs-terminal.vercel.app/services/copywriting-ghostwriting",
    sub_capabilities: ["Website Copy", "Blogs & Articles", "Sales Pages", "Email Campaigns"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECF]"
  },
  "Discord Server Management": {
    key: "Discord Server Management",
    name: "Discord Server Management",
    category: "Community",
    tagline: "Build an Active and Well Managed Community",
    description: "Create, organize, and moderate active, secure Discord communities that strengthen customer loyalty.",
    url: "https://labs-terminal.vercel.app/services/discord-server-management",
    sub_capabilities: ["Server Setup", "Channel Organization", "Role Management", "Community Moderation"],
    color: "#7B7F73",
    badgeBg: "bg-[#F0F2EB]",
    badgeText: "text-[#4B5043]",
    badgeBorder: "border-[#D9DECF]"
  },
  "Data Cleaning": {
    key: "Data Cleaning",
    name: "Data Cleaning",
    category: "Data & Insights",
    tagline: "Improve Accuracy With Clean and Reliable Data",
    description: "Clean, deduplicate, and standardize messy databases and spreadsheets for reliable reporting.",
    url: "https://labs-terminal.vercel.app/services/data-cleaning",
    sub_capabilities: ["Data Cleaning", "Duplicate Removal", "Data Validation", "Spreadsheet Optimization"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "DevOps & Cloud Solutions": {
    key: "DevOps & Cloud Solutions",
    name: "DevOps & Cloud Solutions",
    category: "Infrastructure",
    tagline: "Build Reliable Infrastructure That Scales With Your Business",
    description: "Deploy, automate, and manage secure, auto-scaling cloud environments, Docker/K8s, and CI/CD.",
    url: "https://labs-terminal.vercel.app/services/devops-cloud-solutions",
    sub_capabilities: ["Cloud Deployment", "CI/CD Pipelines", "Docker & Kubernetes", "Server Management"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  },
  "UI/UX & Brand Identity Design": {
    key: "UI/UX & Brand Identity Design",
    name: "UI/UX & Brand Identity Design",
    category: "Design",
    tagline: "Create Memorable Experiences That Strengthen Your Brand",
    description: "Craft intuitive digital user experiences and distinctive brand identities that build authority and trust.",
    url: "https://labs-terminal.vercel.app/services/ui-ux-brand-identity-design",
    sub_capabilities: ["UI Design", "UX Research", "Wireframing", "Prototyping"],
    color: "#59664A",
    badgeBg: "bg-[#E7EEDB]",
    badgeText: "text-[#59664A]",
    badgeBorder: "border-[#D1DCC2]"
  }
};
