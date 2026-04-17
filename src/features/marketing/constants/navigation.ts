import { Rocket, Sparkles, GraduationCap, Presentation, Radio, Zap, Layout, BookOpen, Newspaper, History, HelpCircle, Users } from "lucide-react";

export const PRODUCTS = [
  { title: "Multivrs Space", description: "Next-gen hosting and deployment platform.", icon: Rocket, href: "/products/space" },
  { title: "Kontinue AI", description: "Intelligent workflows for modern teams.", icon: Sparkles, href: "/products/ai" },
  { title: "Multivrs Learn", description: "Master the next generation of software.", icon: GraduationCap, href: "/products/learn" },
  { title: "Present", description: "Immersive presentation software for creators.", icon: Presentation, href: "/products/present" },
  { title: "EchoLive", description: "Live event and production software.", icon: Radio, href: "/products/echo" },
  { title: "Nexus", description: "The high-performance framework for the web.", icon: Zap, href: "/products/nexus" },
  { title: "UI Library", description: "Premium components for rapid development.", icon: Layout, href: "/products/ui" },
];

export const RESOURCES = [
  { title: "Documentation", description: "Guides and references for everything.", icon: BookOpen, href: "/docs" },
  { title: "Blog", description: "The latest news and technical insights.", icon: Newspaper, href: "/blog" },
  { title: "Changelog", description: "See what's new in the multivrs ecosystem.", icon: History, href: "/changelog" },
  { title: "Help Center", description: "Get support and find answers.", icon: HelpCircle, href: "/help" },
  { title: "Community", description: "Join the conversation with other creators.", icon: Users, href: "/community" },
];

export const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Company", href: "/about" },
] as const;
