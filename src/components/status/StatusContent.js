'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import UptimeGraph from "@/components/services/UptimeGraph";
import { formatDistanceToNow } from "date-fns";

export default function StatusContent({ initialServices, initialIncidents }) {
  const [services, setServices] = useState(initialServices);
  const [incidents, setIncidents] = useState(initialIncidents);

  const activeIncidents = incidents.filter(incident => 
    incident.status !== 'resolved'
  );

  return (
    <>
      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Incidents</h2>
          <div className="space-y-4">
            {activeIncidents.map((incident) => (
              <Card key={incident._id} className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {incident.title}
                    </h3>
                    <p className="mt-1 text-gray-500">{incident.description}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'identified' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(incident.createdAt))} ago
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Services Status */}
      <div className="grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
        {services.map((service) => (
          <Card key={service._id} className="flex flex-col overflow-hidden">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-900">
                  {service.name}
                </p>
                <p className="mt-3 text-base text-gray-500">
                  {service.description}
                </p>
              </div>
              <div className="mt-6">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                  service.status === 'operational' ? 'bg-green-100 text-green-800' :
                  service.status === 'degraded_performance' ? 'bg-yellow-100 text-yellow-800' :
                  service.status === 'partial_outage' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {service.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-4">
                <UptimeGraph serviceId={service._id} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
} 