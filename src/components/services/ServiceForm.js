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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    description: z.string().min(2, "Description must be at least 2 characters").max(500, "Description cannot exceed 500 characters"),
    status: z.enum([
        "operational",
        "degraded_performance",
        "partial_outage",
        "major_outage"
    ], "Please select a valid status"),
});

export default function ServiceForm({ onServiceCreated, onServiceUpdated, editingService, onCancel }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'operational'
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

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
        setLoading(true);
        
        try {
            // Validate form data
            const validatedData = formSchema.parse(formData);
            
            const url = editingService
                ? `/api/services/${editingService._id}`
                : '/api/services';

            const method = editingService ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to save service');
            }

            const savedService = await response.json();

            if (editingService) {
                onServiceUpdated(savedService);
                toast({
                    title: "Success",
                    description: "Service updated successfully",
                    variant: "success",
                });
            } else {
                onServiceCreated(savedService);
                toast({
                    title: "Success",
                    description: "Service created successfully",
                    variant: "success",
                });
            }

            setFormData({ name: '', description: '', status: 'operational' });
            setOpen(false);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle validation errors
                error.errors.forEach((err) => {
                    toast({
                        title: "Validation Error",
                        description: err.message,
                        variant: "destructive",
                    });
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to save service",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
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
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
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
                                <SelectItem value="degraded_performance" className="text-black hover:bg-gray-100">
                                    Degraded Performance
                                </SelectItem>
                                <SelectItem value="partial_outage" className="text-black hover:bg-gray-100">
                                    Partial Outage
                                </SelectItem>
                                <SelectItem value="major_outage" className="text-black hover:bg-gray-100">
                                    Major Outage
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
                        <LoadingButton 
                            type="submit" 
                            loading={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {editingService ? 'Update Service' : 'Create Service'}
                        </LoadingButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 