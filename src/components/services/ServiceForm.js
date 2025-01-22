"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(500),
  status: z.enum(["operational", "degraded", "partial_outage", "major_outage"]),
});

export default function ServiceForm({ onServiceCreated, onServiceUpdated, editingService, onCancel }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'operational'
  });

  // Populate form when editingService changes
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        status: editingService.status
      });
      setOpen(true);
    }
  }, [editingService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingService 
        ? `/api/services/${editingService._id}` 
        : '/api/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save service');
      }

      const savedService = await response.json();
      
      if (editingService) {
        onServiceUpdated(savedService);
      } else {
        onServiceCreated(savedService);
      }

      // Reset form and close dialog
      setFormData({ name: '', description: '', status: 'operational' });
      setOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', status: 'operational' });
    setOpen(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black border border-gray-200 hover:bg-gray-100">
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="border-gray-200 focus:border-gray-400 text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="border-gray-200 focus:border-gray-400 text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-black">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-white border-gray-200 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="operational" className="text-black hover:bg-gray-100">
                  Operational
                </SelectItem>
                <SelectItem value="degraded" className="text-black hover:bg-gray-100">
                  Degraded
                </SelectItem>
                <SelectItem value="down" className="text-black hover:bg-gray-100">
                  Down
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              onClick={handleCancel}
              className="bg-white text-black border border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {editingService ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 