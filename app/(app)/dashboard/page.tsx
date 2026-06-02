import { PackDashboard } from "@/components/pack-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { listPacksForUser } from "@/lib/repositories/packs";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const packs = await listPacksForUser(user.id);

  return <PackDashboard userName={user.name} initialPacks={packs} />;
}
