"use client";

import { useState, useEffect } from 'react';
import ServiceForm from './ServiceForm';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from "@/components/ui/use-toast";
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

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const { socket, isConnected, sendMessage } = useWebSocket();
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
      title: "Success",
      description: "Service updated successfully",
    });
  };

  const handleServiceCreated = (newService) => {
    setServices(prev => [...prev, newService]);
    toast({
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
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (isConnected) {
      // Join service updates room
      sendMessage('joinServiceUpdates');

      // Add message listener
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'serviceUpdated') {
            setServices(prevServices => 
              prevServices.map(service => 
                service._id === data.service._id ? data.service : service
              )
            );

            toast({
              title: "Service Updated",
              description: `${data.service.name} status changed to ${data.service.status}`,
            });
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
    }
  }, [isConnected, socket, sendMessage]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
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
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">Name</TableHead>
                <TableHead className="text-black">Description</TableHead>
                <TableHead className="text-black">Status</TableHead>
                <TableHead className="text-black text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium text-black">{service.name}</TableCell>
                  <TableCell className="text-black">{service.description}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.status === 'operational' ? 'bg-green-100 text-green-800' :
                      service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.status}
                    </div>
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