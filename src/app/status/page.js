import StatusContent from "@/components/status/StatusContent";
import connectDB from '@/lib/db';
import { Service } from '@/lib/models/service';
import { Incident } from '@/lib/models/incident';

async function getServices() {
    await connectDB();
    return Service.find().lean();
}

async function getIncidents() {
    await connectDB();
    return Incident.find()
        .populate('services', 'name status')
        .sort({ createdAt: -1 })
        .lean(); 
}

export default async function StatusPage() {
    const [services, incidents] = await Promise.all([
      getServices(),
      getIncidents()
    ]);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="mt-3 text-xl text-gray-500">
              Current status of our services
            </p>
          </div>
          <StatusContent initialServices={services} initialIncidents={incidents} />
        </div>
      </div>
    );
  }