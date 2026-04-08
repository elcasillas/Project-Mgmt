import { PageHeader } from "@/components/shared/page-header";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";
import { TeamDirectory } from "@/components/team/team-directory";
import { getTeamMembers } from "@/lib/data/queries";

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-8">
      <RealtimeRefresh tables={["profiles", "project_members", "tasks"]} />
      <PageHeader
        eyebrow="People"
        title="Team"
        description="See who is staffed where, current workload, and role coverage across active initiatives."
      />
      <TeamDirectory members={members} />
    </div>
  );
}
