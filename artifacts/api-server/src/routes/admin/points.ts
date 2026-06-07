import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, pointTransactionsTable } from "@workspace/db";
import { AdjustPointsBody, AdjustPointsParams } from "@workspace/api-zod";
import { requireAuth } from "../../lib/auth";
import { getMembershipLevel } from "../../lib/membership";

const router: IRouter = Router();

router.get("/admin/points", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: pointTransactionsTable.id,
      customerId: pointTransactionsTable.customerId,
      customerName: customersTable.name,
      points: pointTransactionsTable.points,
      type: pointTransactionsTable.type,
      reason: pointTransactionsTable.reason,
      serviceId: pointTransactionsTable.serviceId,
      referralId: pointTransactionsTable.referralId,
      createdAt: pointTransactionsTable.createdAt,
    })
    .from(pointTransactionsTable)
    .leftJoin(customersTable, eq(pointTransactionsTable.customerId, customersTable.id))
    .orderBy(desc(pointTransactionsTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      customerName: r.customerName ?? null,
      serviceId: r.serviceId ?? null,
      referralId: r.referralId ?? null,
    })),
  );
});

router.post(
  "/admin/customers/:customerId/points",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = AdjustPointsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = AdjustPointsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, params.data.customerId));

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const delta = parsed.data.type === "deduct" ? -parsed.data.points : parsed.data.points;
    const newPoints = Math.max(0, customer.totalPoints + delta);
    const newMembership = getMembershipLevel(newPoints);

    await db
      .update(customersTable)
      .set({ totalPoints: newPoints, membershipLevel: newMembership })
      .where(eq(customersTable.id, params.data.customerId));

    const [txn] = await db
      .insert(pointTransactionsTable)
      .values({
        customerId: params.data.customerId,
        points: parsed.data.type === "deduct" ? -parsed.data.points : parsed.data.points,
        type: parsed.data.type,
        reason: parsed.data.reason,
      })
      .returning();

    res.status(201).json({
      ...txn,
      customerName: customer.name,
      serviceId: txn.serviceId ?? null,
      referralId: txn.referralId ?? null,
    });
  },
);

export default router;
