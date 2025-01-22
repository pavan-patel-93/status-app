import { Card } from "@/components/ui/card";

async function getServices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/services`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export default async function StatusPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="mt-3 text-xl text-gray-500">
            Current status of our services
          </p>
        </div>

        <div className="mt-12">
          <div className="grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {services.map((service) => (
              <Card key={service._id} className="flex flex-col overflow-hidden bg-white border border-gray-200">
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-900">{service.name}</p>
                    <p className="mt-3 text-base text-gray-500">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                        service.status === 'operational'
                          ? 'bg-green-900 text-green-300'
                          : service.status === 'degraded'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 