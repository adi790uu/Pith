import { PackDashboard } from "@/components/pack-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <PackDashboard userName={user.name} />;
}
