import { prisma } from "../../lib/prisma.js";

/**
 * Get dashboard summary with key financial metrics
 * Returns: total income, total expense, net balance
 */
export const getDashboardSummary = async (req: any, res: any): Promise<void> => {
    try {
        const user = req.user;

        // Aggregate income records
        const incomeAgg = await prisma.task.aggregate({
            where: { type: "INCOME" },
            _sum: { amount: true },
            _count: true,
        });

        // Aggregate expense records
        const expenseAgg = await prisma.task.aggregate({
            where: { type: "EXPENSE" },
            _sum: { amount: true },
            _count: true,
        });

        const totalIncome = incomeAgg._sum.amount ? Number(incomeAgg._sum.amount) : 0;
        const totalExpense = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;
        const netBalance = totalIncome - totalExpense;

        res.json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                netBalance,
            },
            message: "Dashboard summary retrieved successfully",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to retrieve dashboard summary" });
    }
};

/**
 * Get dashboard insights with aggregated financial data
 * Returns:
 *  - category-wise totals
 *  - recent activity (last 5 records)
 *  - monthly trend
 */
export const getDashboardInsights = async (req: any, res: any): Promise<void> => {
    try {
        const user = req.user;

        // Category-wise breakdown using groupBy
        const categoryBreakdownRaw = await prisma.task.groupBy({
            by: ["type", "category"],
            where: {
                type: { in: ["INCOME", "EXPENSE"] },
                category: { not: null },
            },
            _sum: { amount: true },
            _count: true,
        });

        // Format category breakdown with composite keys
        const categoryWiseTotals: Record<string, { count: number; total: number; type: string }> = {};
        categoryBreakdownRaw.forEach((record: any) => {
            const compositeKey = `${record.type}:${record.category}`;
            categoryWiseTotals[compositeKey] = {
                count: record._count,
                total: record._sum.amount ? Number(record._sum.amount) : 0,
                type: record.type,
            };
        });

        // Recent activity - last 5 financial records
        const recentActivity = await prisma.task.findMany({
            where: {
                type: { in: ["INCOME", "EXPENSE"] },
            },
            select: {
                id: true,
                title: true,
                amount: true,
                type: true,
                category: true,
                date: true,
                status: true,
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
            take: 5,
        });

        // Monthly trend - group by month and year
        const allRecords = await prisma.task.findMany({
            where: {
                type: { in: ["INCOME", "EXPENSE"] },
            },
            select: {
                amount: true,
                type: true,
                date: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        // Group records by year-month (YYYY-MM format)
        const monthlyTrendMap: Record<string, { income: number; expense: number; net: number }> = {};
        
        allRecords.forEach((record: any) => {
            const date = new Date(record.date);
            const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM format
            
            if (!monthlyTrendMap[yearMonth]) {
                monthlyTrendMap[yearMonth] = { income: 0, expense: 0, net: 0 };
            }

            const amount = Number(record.amount);
            if (record.type === "INCOME") {
                monthlyTrendMap[yearMonth].income += amount;
            } else if (record.type === "EXPENSE") {
                monthlyTrendMap[yearMonth].expense += amount;
            }

            monthlyTrendMap[yearMonth].net = monthlyTrendMap[yearMonth].income - monthlyTrendMap[yearMonth].expense;
        });

        // Convert to sorted array (most recent first)
        const monthlyTrend = Object.entries(monthlyTrendMap)
            .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
            .map(([month, data]) => ({
                month,
                ...data,
            }));

        res.json({
            success: true,
            data: {
                categoryWiseTotals,
                recentActivity,
                monthlyTrend,
            },
            message: "Dashboard insights retrieved successfully",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to retrieve dashboard insights" });
    }
};
