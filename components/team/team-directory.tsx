import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function TeamDirectory({
  members
}: {
  members: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    activeProjects: number;
    assignedTasks: number;
    workloadSummary: number;
  }>;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Active projects</th>
              <th className="px-6 py-4 font-medium">Assigned tasks</th>
              <th className="px-6 py-4 font-medium">Open workload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 font-medium text-slate-950">{member.full_name}</td>
                <td className="px-6 py-4"><Badge value={member.role} /></td>
                <td className="px-6 py-4 text-slate-600">{member.email}</td>
                <td className="px-6 py-4 text-slate-600">{member.activeProjects}</td>
                <td className="px-6 py-4 text-slate-600">{member.assignedTasks}</td>
                <td className="px-6 py-4 text-slate-600">{member.workloadSummary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
