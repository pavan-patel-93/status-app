"use client";

import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function MultiSelectField({
    form,
    name,
    label,
    placeholder,
    options
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
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
                                <SelectValue placeholder={placeholder}>
                                    {field.value.length > 0
                                        ? options
                                            .filter(option => field.value.includes(option.value))
                                            .map(option => option.label)
                                            .join(', ')
                                        : placeholder
                                    }
                                </SelectValue>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className={field.value.includes(option.value) ? "bg-blue-50" : ""}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
} 