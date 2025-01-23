"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import IncidentForm from "./IncidentForm";
import { LoadingPage } from "../ui/loading";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents");
      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      setIncidents([]);
      setLoading(false);
    }
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleDeleteClick = (incident) => {
    setIncidentToDelete(incident);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!incidentToDelete) return;

    try {
      const response = await fetch(`/api/incidents/${incidentToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete incident");

      setIncidents((prev) =>
        prev.filter((incident) => incident._id !== incidentToDelete._id)
      );
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    } catch (error) {
      console.error("Error deleting incident:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "identified":
        return "bg-blue-100 text-blue-800";
      case "monitoring":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactBadgeClass = (impact) => {
    switch (impact) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "major":
        return "bg-orange-100 text-orange-800";
      case "minor":
        return "bg-yellow-100 text-yellow-800";
      case "none":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  const incidentsArray = Array.isArray(incidents) ? incidents : [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Incidents</h2>
        <IncidentForm onIncidentCreated={handleIncidentCreated} />
      </div>

      {incidentsArray.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-black">No incidents found.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-blue-50 border-b">
              <TableRow>
                <TableHead className="font-semibold text-blue-900">Title</TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
                <TableHead className="font-semibold text-blue-900">Impact</TableHead>
                <TableHead className="font-semibold text-blue-900">Affected Services</TableHead>
                <TableHead className="font-semibold text-blue-900">Created</TableHead>
                <TableHead className="font-semibold text-blue-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentsArray.map((incident) => (
                <TableRow key={incident._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-black">{incident.title}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        incident.status
                      )}`}
                    >
                      {incident.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactBadgeClass(
                        incident.impact
                      )}`}
                    >
                      {incident.impact}
                    </span>
                  </TableCell>
                  <TableCell className="text-black">
                    {Array.isArray(incident.services)
                      ? incident.services
                          .map((service) => service.name)
                          .join(", ")
                      : ""}
                  </TableCell>
                  <TableCell className="text-black">
                    {formatDistanceToNow(new Date(incident.createdAt))} ago
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDeleteClick(incident)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Delete Incident</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete "{incidentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-black border border-gray-200 hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 