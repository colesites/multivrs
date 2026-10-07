import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { apiUrl } from "@/lib/api";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardApp apiUrl={apiUrl} />;
}
