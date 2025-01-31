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
import { SelectField } from "@/components/ui/select-field";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const SERVICE_CONFIG = {
    schema: z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters"),
        description: z.string()
            .min(2, "Description must be at least 2 characters")
            .max(500, "Description cannot exceed 500 characters"),
        status: z.enum([
            "operational",
            "degraded_performance",
            "partial_outage",
            "major_outage"
        ], "Please select a valid status"),
    }),
    defaultValues: {
        name: '',
        description: '',
        status: 'operational'
    },
    statusOptions: [
        { value: 'operational', label: 'Operational' },
        { value: 'degraded_performance', label: 'Degraded Performance' },
        { value: 'partial_outage', label: 'Partial Outage' },
        { value: 'major_outage', label: 'Major Outage' }
    ]
};

export default function ServiceForm({ onServiceCreated, onServiceUpdated, editingService, onCancel }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(SERVICE_CONFIG.schema),
        defaultValues: SERVICE_CONFIG.defaultValues,
    });

    // Reset form and populate with editing service data when available
    useEffect(() => {
        if (editingService) {
            form.reset({
                name: editingService.name,
                description: editingService.description,
                status: editingService.status
            });
            setOpen(true);
        }
    }, [editingService, form]);

    const showToast = (title, description, variant = "default") => {
        toast({ title, description, variant });
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        
        try {
            const url = editingService
                ? `/api/services/${editingService._id}`
                : '/api/services';

            const response = await fetch(url, {
                method: editingService ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to save service');
            }

            const savedService = await response.json();

            if (editingService) {
                onServiceUpdated(savedService);
                showToast("Success", "Service updated successfully", "success");
            } else {
                onServiceCreated(savedService);
                showToast("Success", "Service created successfully", "success");
            }

            handleClose();
        } catch (error) {
            console.error('Service save error:', error);
            showToast("Error", "Failed to save service", "destructive");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.reset(SERVICE_CONFIG.defaultValues);
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-black">Name</Label>
                        <Input
                            id="name"
                            {...form.register('name')}
                            className="border-gray-200 focus:border-gray-400 text-black"
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-black">Description</Label>
                        <Input
                            id="description"
                            {...form.register('description')}
                            className="border-gray-200 focus:border-gray-400 text-black"
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <SelectField
                        form={form}
                        name="status"
                        label="Status"
                        placeholder="Select status"
                        options={SERVICE_CONFIG.statusOptions}
                        className="space-y-2"
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={handleClose}
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