"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { MultiSelectField } from "@/components/ui/multi-select-field";

// Schema and constants moved to separate file
const FORM_CONFIG = {
    schema: z.object({
        title: z.string().min(2).max(100),
        description: z.string().min(2).max(1000),
        status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
        impact: z.enum(['none', 'minor', 'major', 'critical']),
        services: z.array(z.string()).min(1),
    }),
    defaultValues: {
        title: "",
        description: "",
        status: "investigating",
        impact: "minor",
        services: [],
    },
    statusOptions: [
        { value: 'investigating', label: 'Investigating' },
        { value: 'identified', label: 'Identified' },
        { value: 'monitoring', label: 'Monitoring' },
        { value: 'resolved', label: 'Resolved' }
    ],
    impactOptions: [
        { value: 'none', label: 'None' },
        { value: 'minor', label: 'Minor' },
        { value: 'major', label: 'Major' },
        { value: 'critical', label: 'Critical' }
    ]
};

export default function IncidentForm({ onIncidentCreated }) {
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState([]);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(FORM_CONFIG.schema),
        defaultValues: FORM_CONFIG.defaultValues,
    });

    const handleDialogOpen = async (isOpen) => {
        if (isOpen) {
            await fetchServices();
        }
        setOpen(isOpen);
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            showErrorToast("Failed to fetch services");
        }
    };

    const showSuccessToast = (message) => {
        toast({ title: "Success", description: message });
    };

    const showErrorToast = (message) => {
        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });
    };

    const onSubmit = async (data) => {
        try {
            const response = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create incident");
            }

            const incident = await response.json();
            onIncidentCreated(incident);
            setOpen(false);
            form.reset();
            showSuccessToast("Incident created successfully");
        } catch (error) {
            console.error('Error creating incident:', error);
            showErrorToast("Failed to create incident");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Create Incident
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Incident</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Incident title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the incident"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SelectField
                            form={form}
                            name="status"
                            label="Status"
                            placeholder="Select status"
                            options={FORM_CONFIG.statusOptions}
                        />
                        <SelectField
                            form={form}
                            name="impact"
                            label="Impact"
                            placeholder="Select impact"
                            options={FORM_CONFIG.impactOptions}
                        />
                        <MultiSelectField
                            form={form}
                            name="services"
                            label="Affected Services"
                            placeholder="Select services"
                            options={services.map(service => ({
                                value: service._id,
                                label: service.name
                            }))}
                        />
                        <Button 
                            type="submit" 
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Create Incident
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 