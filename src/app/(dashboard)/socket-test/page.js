import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SocketTest from "@/components/socket/SocketTest";

export default function SocketTestPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Socket Test</h1>
        <SocketTest />
      </div>
    </DashboardLayout>
  );
} 