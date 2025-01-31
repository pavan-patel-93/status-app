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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SelectField } from "@/components/ui/select-field";

const formSchema = z.object({
    title: z.string().min(2).max(100),
    description: z.string().min(2).max(1000),
    status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
    impact: z.enum(['none', 'minor', 'major', 'critical']),
    services: z.array(z.string()).min(1),
});

const STATUS_OPTIONS = [
    { value: 'investigating', label: 'Investigating' },
    { value: 'identified', label: 'Identified' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'resolved', label: 'Resolved' }
];

const IMPACT_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'minor', label: 'Minor' },
    { value: 'major', label: 'Major' },
    { value: 'critical', label: 'Critical' }
];

export default function IncidentForm({ onIncidentCreated }) {
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState([]);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "investigating",
            impact: "minor",
            services: [],
        },
    });

    // Fetch services when the dialog opens
    const handleDialogOpen = async (open) => {
        if (open) {
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
            }
        }
        setOpen(open);
    };

    const onSubmit = async (data) => {
        try {
            const response = await fetch("/api/incidents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create incident");
            }

            const incident = await response.json();
            onIncidentCreated(incident);
            setOpen(false);
            form.reset();
            
            toast({
                title: "Success",
                description: "Incident created successfully",
            });
        } catch (error) {
            console.error('Error creating incident:', error);
            toast({
                title: "Error",
                description: "Failed to create incident",
                variant: "destructive",
            });
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
                        options={STATUS_OPTIONS}
                    />
                    <SelectField
                        form={form}
                        name="impact"
                        label="Impact"
                        placeholder="Select impact"
                        options={IMPACT_OPTIONS}
                    />
                    <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Affected Services</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const updatedValues = field.value.includes(value)
                                            ? field.value.filter(v => v !== value)
                                            : [...field.value, value];
                                        field.onChange(updatedValues);
                                    }}
                                    value={field.value[0] || ""} 
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select services">
                                                {field.value.length > 0 
                                                    ? services
                                                        .filter(service => field.value.includes(service._id))
                                                        .map(service => service.name)
                                                        .join(', ')
                                                    : "Select services"
                                                }
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {services.map((service) => (
                                            <SelectItem 
                                                key={service._id} 
                                                value={service._id}
                                                className={field.value.includes(service._id) ? "bg-blue-50" : ""}
                                            >
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                        Create Incident
                    </Button>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
);
} 