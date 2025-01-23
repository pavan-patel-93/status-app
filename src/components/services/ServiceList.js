"use client";

import { useState, useEffect } from 'react';
import ServiceForm from './ServiceForm';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from "@/components/ui/use-toast";
import { LoadingPage } from "@/components/ui/loading";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const { socket, isConnected, sendMessage } = useWebSocket();
  console.log("websocket", socket);
  const { toast } = useToast();

  const handleEdit = (service) => {
    setEditingService(service);
  };

  const handleServiceUpdated = (updatedService) => {
    setServices(prev => prev.map(service => 
      service._id === updatedService._id ? updatedService : service
    ));
    setEditingService(null);
    toast({
      variant: "success",
      title: "Success",
      description: "Service updated successfully",
    });
  };

  const handleServiceCreated = (newService) => {
    setServices(prev => [...prev, newService]);
    toast({
      variant: "success",
      title: "Success",
      description: "Service created successfully",
    });
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await fetch(`/api/services/${serviceToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      setServices(prev => prev.filter(service => service._id !== serviceToDelete._id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service",
      });
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const updateServiceStatus = async (serviceId, newStatus) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update service status');

      const updatedService = await response.json();
      setServices(prev => prev.map(service => 
        service._id === serviceId ? updatedService : service
      ));

      toast({
        title: "Success",
        description: "Service status updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service status",
      });
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (!socket) return;
  
    // Join service updates room
    sendMessage('joinServiceUpdates');
  
    // Add Socket.IO listener
    socket.on('serviceUpdated', (data) => {
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === data.service._id ? data.service : service
        )
      );
  
      toast({
        title: "Service Updated",
        description: `${data.service.name} status changed to ${data.service.status}`,
      });
    });
  
    // Cleanup listener on unmount
    return () => {
      if (socket) {
        socket.off('serviceUpdated');
      }
    };
  }, [socket, sendMessage]);


  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch services",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Services</h2>
        <ServiceForm 
          onServiceCreated={handleServiceCreated} 
          onServiceUpdated={handleServiceUpdated}
          editingService={editingService}
          onCancel={() => setEditingService(null)}
        />
      </div>
      {services.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-black">No services found. Add your first service to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-blue-50 border-b">
              <TableRow>
                <TableHead className="font-semibold text-blue-900">Name</TableHead>
                <TableHead className="font-semibold text-blue-900">Description</TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
                <TableHead className="font-semibold text-blue-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-black">{service.name}</TableCell>
                  <TableCell className="text-black">{service.description}</TableCell>
                  <TableCell>
                    <Select
                      value={service.status}
                      onValueChange={(value) => updateServiceStatus(service._id, value)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="degraded_performance">Degraded Performance</SelectItem>
                        <SelectItem value="partial_outage">Partial Outage</SelectItem>
                        <SelectItem value="major_outage">Major Outage</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service)}
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
            <AlertDialogTitle className="text-black">
              Delete Service
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white text-black border border-gray-200 hover:bg-gray-100"
            >
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