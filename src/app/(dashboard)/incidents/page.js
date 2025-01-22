import DashboardLayout from "@/components/dashboard/DashboardLayout";
import IncidentList from "@/components/incidents/IncidentList";

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
        <IncidentList />
      </div>
    </DashboardLayout>
  );
}
