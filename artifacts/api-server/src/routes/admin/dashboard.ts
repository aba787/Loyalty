import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, customersTable, commissionsTable, referralsTable } from "@workspace/db";
import { requireAuth } from "../../lib/auth";

const router: IRouter = Router();

router.get("/admin/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalCustomers: sql<number>`count(*)::int`,
      totalPoints: sql<number>`coalesce(sum(total_points), 0)::int`,
      totalRevenue: sql<number>`coalesce(sum(total_spent), 0)::float`,
      totalReferrals: sql<number>`coalesce(sum(referral_count), 0)::int`,
    })
    .from(customersTable);

  const commissions = await db.select().from(commissionsTable);
  const totalCommissionsPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingCommissions = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  res.json({
    totalCustomers: stats.totalCustomers ?? 0,
    totalPoints: stats.totalPoints ?? 0,
    totalRevenue: stats.totalRevenue ?? 0,
    totalReferrals: stats.totalReferrals ?? 0,
    totalCommissionsPaid,
    pendingCommissions,
  });
});

router.get("/admin/dashboard/membership-breakdown", requireAuth, async (_req, res): Promise<void> => {
  const customers = await db.select().from(customersTable);
  const levels = ["Bronze", "Silver", "Gold", "Platinum"];
  const breakdown = levels.map((level) => ({
    level,
    count: customers.filter((c) => c.membershipLevel === level).length,
  }));
  res.json(breakdown);
});

router.get("/admin/dashboard/top-customers", requireAuth, async (_req, res): Promise<void> => {
  const customers = await db
    .select()
    .from(customersTable)
    .orderBy(desc(customersTable.totalPoints))
    .limit(10);

  res.json(
    customers.map((c) => ({
      ...c,
      totalSpent: Number(c.totalSpent),
      clerkUserId: c.clerkUserId ?? null,
      phone: c.phone ?? null,
      referredByCode: c.referredByCode ?? null,
    })),
  );
});

export default router;
