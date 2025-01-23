import DashboardLayout from "@/components/dashboard/DashboardLayout";
import IncidentList from "@/components/incidents/IncidentList";

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <IncidentList />
      </div>
    </DashboardLayout>
  );
}
