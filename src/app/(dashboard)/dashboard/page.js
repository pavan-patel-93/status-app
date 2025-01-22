"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalServices: 0,
    activeIncidents: 0,
    systemStatus: 'operational'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const servicesRes = await fetch('/api/services');
      const services = await servicesRes.json();

      const incidentsRes = await fetch('/api/incidents');
      const incidents = await incidentsRes.json();

      const activeIncidents = incidents.filter(
        incident => incident.status !== 'resolved'
      ).length;

      const systemStatus = services.some(service => service.status === 'down')
        ? 'degraded'
        : 'operational';

      setMetrics({
        totalServices: services.length,
        activeIncidents,
        systemStatus
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Partial System Outage';
      default:
        return 'Major System Outage';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-black">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-black">
                {metrics.totalServices}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-black">
                {metrics.activeIncidents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(metrics.systemStatus)}`}>
                {getStatusText(metrics.systemStatus)}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-black text-center py-4">
                No recent activity to display
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
