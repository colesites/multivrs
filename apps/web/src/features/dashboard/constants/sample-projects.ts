import type { DashboardProject } from "@/features/dashboard/types/project.types";

/**
 * PLACEHOLDER project data for design iteration. There is no Project model in
 * the schema yet — replace this with a real query (Convex/Neon) once it exists.
 */
export const SAMPLE_PROJECTS: DashboardProject[] = [
  {
    slug: "kontinue-ai",
    name: "kontinue-ai",
    domain: "chat.kontinueai.com",
    repo: "colesites/kontinueai",
    status: "error",
    commitMessage: "feat: implement comprehensive resource access control",
    branch: "main",
    updatedAt: "2d ago",
  },
  {
    slug: "image-slider-gallery",
    name: "image-slider-gallery",
    domain: "image-slider-gallery.vercel.app",
    repo: "colesites/image-slider-gallery",
    status: "ready",
    commitMessage: "feat: responsive layout and entrance animations",
    branch: "main",
    updatedAt: "Jun 16",
  },
  {
    slug: "ui-swift-rust",
    name: "ui-swift-rust",
    domain: "ui-swift-rust.vercel.app",
    repo: "colesites/swift-rust",
    status: "ready",
    commitMessage: "refactor: replace inline SVG logo with favicon",
    branch: "main",
    updatedAt: "Jun 14",
  },
  {
    slug: "present-gha",
    name: "present-gha",
    domain: "present.c-technology-inc.com",
    repo: "colesites/present",
    status: "ready",
    commitMessage: "feat(ai-operator): real-time operator functionality",
    branch: "master",
    updatedAt: "Jun 7",
  },
  {
    slug: "multivrs-space",
    name: "multivrs-space",
    domain: "multivrs.vercel.app",
    repo: "colesites/multivrs",
    status: "ready",
    commitMessage: "feat: immersive 3D hero section with GSAP animations",
    branch: "main",
    updatedAt: "Apr 14",
  },
  {
    slug: "echolive-gha",
    name: "echolive-gha",
    domain: "echolive-gha.vercel.app",
    repo: "colesites/echolive",
    status: "building",
    commitMessage: "feat: new marketing site with responsive components",
    branch: "main",
    updatedAt: "May 26",
  },
];
