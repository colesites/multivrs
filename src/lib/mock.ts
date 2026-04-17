export const mockUser = {
  name: "Ryan Crawford",
  email: "ryan@multivrs.space",
  avatar: "https://i.pravatar.cc/150?u=ryan",
  plan: "Pro",
};

export const mockMetrics = {
  totalDeployments: 142,
  activeProjects: 12,
  totalBandwidth: "1.2 TB",
  apiRequests: "2.4M",
  uptime: "99.99%",
  bandwidthChange: "+12.4%",
  apiRequestsChange: "+5.2%",
  deploymentsChange: "+2",
};

export const mockActivityHistory = [
  { name: "Mon", value: 300 },
  { name: "Tue", value: 450 },
  { name: "Wed", value: 800 },
  { name: "Thu", value: 650 },
  { name: "Fri", value: 900 },
  { name: "Sat", value: 200 },
  { name: "Sun", value: 400 },
];

export const mockProjects = [
  {
    id: "proj_1",
    name: "Kontinue AI",
    framework: "Next.js",
    lastCommit: "Update landing page copy",
    deployedAt: "15 minutes ago",
    status: "Ready",
    environment: "Production",
    url: "kontinue.ai",
  },
  {
    id: "proj_2",
    name: "Multivrs Space",
    framework: "Next.js",
    lastCommit: "Fix sidebar layout",
    deployedAt: "2 hours ago",
    status: "Building",
    environment: "Preview",
    url: "preview-123.multivrs.space",
  },
  {
    id: "proj_3",
    name: "EchoLive",
    framework: "Vite",
    lastCommit: "Add church projection templates",
    deployedAt: "1 day ago",
    status: "Error",
    environment: "Production",
    url: "echolive.io",
  },
  {
    id: "proj_4",
    name: "Nexus Framework",
    framework: "Next.js",
    lastCommit: "Bump version to v1.2",
    deployedAt: "3 days ago",
    status: "Ready",
    environment: "Production",
    url: "nexus.dev",
  },
];

export const mockDeployments = [
  {
    id: "dep_123",
    project: "Kontinue AI",
    status: "Ready",
    url: "kontinue-ai-hx9.multivrs.space",
    branch: "main",
    duration: "45s",
    createdAt: "15m ago",
  },
  {
    id: "dep_122",
    project: "Multivrs Space",
    status: "Building",
    url: "multivrs-x2.multivrs.space",
    branch: "feature/sidebar",
    duration: "-",
    createdAt: "2h ago",
  },
  {
    id: "dep_121",
    project: "EchoLive",
    status: "Error",
    url: "echolive-b3.multivrs.space",
    branch: "main",
    duration: "1m 12s",
    createdAt: "1d ago",
  },
  {
    id: "dep_120",
    project: "Kontinue AI",
    status: "Ready",
    url: "kontinue-ai-hx8.multivrs.space",
    branch: "main",
    duration: "42s",
    createdAt: "2d ago",
  },
];

export const mockDomains = [
  {
    id: "dom_1",
    name: "kontinue.ai",
    project: "Kontinue AI",
    status: "Verified",
    ssl: "Active",
    addedAt: "Oct 12, 2025",
  },
  {
    id: "dom_2",
    name: "multivrs.space",
    project: "Multivrs Space",
    status: "Verified",
    ssl: "Active",
    addedAt: "Oct 10, 2025",
  },
  {
    id: "dom_3",
    name: "echolive.io",
    project: "EchoLive",
    status: "Pending",
    ssl: "Pending",
    addedAt: "2 hours ago",
  },
];

export const mockLogs = [
  { id: "log_1", level: "INFO", message: "Deployment started for multivrs-x2", timestamp: "10:24:01 AM", service: "build-worker" },
  { id: "log_2", level: "INFO", message: "Cloning repository multivrs/space@main", timestamp: "10:24:03 AM", service: "git-fetch" },
  { id: "log_3", level: "WARN", message: "Dependency resolution took longer than expected (14s)", timestamp: "10:24:18 AM", service: "npm-install" },
  { id: "log_4", level: "INFO", message: "Building Next.js application...", timestamp: "10:24:20 AM", service: "next-build" },
  { id: "log_5", level: "ERROR", message: "Failed to resolve module 'lucide-react/Github'", timestamp: "10:25:01 AM", service: "next-build" },
  { id: "log_6", level: "INFO", message: "Retrying build with cache bypass...", timestamp: "10:25:10 AM", service: "build-worker" },
  { id: "log_7", level: "INFO", message: "Build completed successfully in 42s", timestamp: "10:25:52 AM", service: "next-build" },
  { id: "log_8", level: "INFO", message: "Starting deployment to Edge Network", timestamp: "10:25:54 AM", service: "edge-deployer" },
];

export const mockEmails = [
  { id: "em_1", address: "contact@kontinue.ai", forwardTo: "ryan@multivrs.space", status: "Active", caught: 1420 },
  { id: "em_2", address: "support@kontinue.ai", forwardTo: "zendesk-routing@multivrs.space", status: "Active", caught: 843 },
  { id: "em_3", address: "sales@echolive.io", forwardTo: "ryan@multivrs.space", status: "Pending MX", caught: 0 },
];

export const mockAnalytics = {
  visitors: 14205,
  visitorsChange: "+24.5%",
  pageviews: 45210,
  pageviewsChange: "+12.1%",
  bounces: "32.4%",
  bouncesChange: "-4.2%",
  topReferrers: [
    { name: "Google", visits: 8402 },
    { name: "Twitter", visits: 3201 },
    { name: "GitHub", visits: 1240 },
    { name: "Direct", visits: 902 },
  ],
  geography: [
    { country: "United States", code: "US", users: 5402 },
    { country: "United Kingdom", code: "GB", users: 2100 },
    { country: "Germany", code: "DE", users: 1420 },
    { country: "Canada", code: "CA", users: 950 },
  ]
};

