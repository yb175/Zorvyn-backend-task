import { prisma } from "../../lib/prisma.js";
import { createCustomerSchema } from "../../utils/customerValidation.js";
import { updateCustomerSchema } from "../../utils/customerValidation.js";

const createCustomer = async (req: any, res: any) => {
    // Create a financial entity (customer) that can be assigned financial records (tasks)
    try {
        const parsed = createCustomerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
        }

        const { name, email, phone } = parsed.data;

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
            },
        });

        res.status(201).json({ success: true, data: customer, message: "Customer created successfully" });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Duplicate entry: A customer with this email or phone already exists." });
        }
        res.status(500).json({ success: false, message: "Failed to create customer" });
    }
};

const getCustomers = async (req: any, res: any) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if(limitNumber <= 0 || pageNumber <= 0) {
            return res.status(400).json({ success: false, message: "Page and limit must be positive integers." });
        }
        const totalRecords = await prisma.customer.count();
        const totalPages = Math.ceil(totalRecords / limitNumber);

        const customers = await prisma.customer.findMany({
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
        });

        res.json({
            success: true,
            data: {
                page: pageNumber,
                limit: limitNumber,
                totalRecords,
                totalPages,
                customers: customers,
            },
            message: "Customers retrieved successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve customers" });
    }
};

const getCustomerById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve customer" });
    }
};

const updateCustomer = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const parsed = updateCustomerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation failed", data: parsed.error.format() });
        }
        const prevCustomer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!prevCustomer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: parsed.data.name || prevCustomer.name ,
                email: parsed.data.email || prevCustomer.email ,
                phone: parsed.data.phone || prevCustomer.phone ,
                company: parsed.data.company || prevCustomer.company ,
            },
        });

        res.json({ success: true, data: customer, message: "Customer updated successfully" });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Duplicate entry: A customer with this email or phone already exists." });
        }
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update customer" });
    }
};

const deleteCustomer = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        await prisma.customer.delete({
            where: { id },
        });

        res.status(200).json({ success: true, message: "Customer deleted successfully" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
};

export default { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };