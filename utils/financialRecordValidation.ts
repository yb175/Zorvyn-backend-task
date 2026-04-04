import { z } from "zod";

export const createFinancialRecordSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    category: z.string().min(1, "Category is required"),
    date: z.string().datetime("Invalid date format").optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    // Keep existing fields for backward compatibility
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
    assignedTo: z.string().uuid("Invalid assignedTo ID format - must be valid UUID"),
    customerId: z.string().uuid("Invalid customerId format - must be valid UUID"),
});

export const updateFinancialRecordSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0").optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().min(1, "Category is required").optional(),
    date: z.string().datetime("Invalid date format").optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
});

export const filterFinancialRecordsSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().optional(),
    dateFrom: z.string().datetime("Invalid dateFrom format").optional(),
    dateTo: z.string().datetime("Invalid dateTo format").optional(),
});
