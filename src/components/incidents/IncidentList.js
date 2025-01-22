"use client";

import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import IncidentForm from './IncidentForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidents([newIncident, ...incidents]);
    toast({
      title: "Success",
      description: "Incident created successfully",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Incidents</h2>
        <IncidentForm onIncidentCreated={handleIncidentCreated} />
      </div>
      {incidents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-gray-500">No incidents reported. Create your first incident to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {incidents.map((incident) => (
            <Card key={incident._id} className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-900">{incident.title}</CardTitle>
                    <CardDescription className="text-gray-500">
                      Created {formatDistanceToNow(new Date(incident.createdAt))} ago
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      incident.status === 'resolved' ? 'success' :
                      incident.status === 'investigating' ? 'warning' :
                      'destructive'
                    }
                  >
                    {incident.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {incident.description}
                </p>
                {incident.updates && incident.updates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Updates</h4>
                    {incident.updates.map((update, index) => (
                      <div key={index} className="text-sm">
                        <p className="text-gray-600">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(update.createdAt))} ago
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 