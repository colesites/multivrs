import { LayoutDashboard, FolderGit2, Server, Globe, BarChart3, Mail, TerminalSquare } from "lucide-react";

export const NAV_GROUPS = [
  {
    title: "",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Platform",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
      { name: "Deployments", href: "/dashboard/deployments", icon: Server },
      { name: "Domains", href: "/dashboard/domains", icon: Globe },
      { name: "Email", href: "/dashboard/email", icon: Mail },
    ]
  },
  {
    title: "Insight",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Logs", href: "/dashboard/logs", icon: TerminalSquare },
    ]
  },
];
