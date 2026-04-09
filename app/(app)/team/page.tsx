import { PageHeader } from "@/components/shared/page-header";
import { TeamDirectory } from "@/components/team/team-directory";
import { getTeamMembers } from "@/lib/data/queries";

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="Team"
        description="See who is staffed where, current workload, and role coverage across active initiatives."
      />
      <TeamDirectory members={members} />
    </div>
  );
}
