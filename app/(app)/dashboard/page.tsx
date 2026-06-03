import { PackDashboard } from "@/components/pack-dashboard";
import { LiveRefresh } from "@/components/live-refresh";
import { getCurrentUser } from "@/lib/auth";
import { isTerminalPackStatus, listPacksForUser } from "@/lib/repositories/packs";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const packs = await listPacksForUser(user.id);

  const hasActivePack = packs.some((pack) => !isTerminalPackStatus(pack.status));

  return (
    <>
      <PackDashboard userName={user.name} initialPacks={packs} />
      <LiveRefresh enabled={hasActivePack} />
    </>
  );
}
