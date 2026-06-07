import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, servicesTable, pointTransactionsTable } from "@workspace/db";
import { AddServiceBody, AddServiceParams } from "@workspace/api-zod";
import { requireAuth } from "../../lib/auth";
import { calcPointsFromAmount, getMembershipLevel } from "../../lib/membership";

const router: IRouter = Router();

router.get("/admin/services", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: servicesTable.id,
      customerId: servicesTable.customerId,
      customerName: customersTable.name,
      name: servicesTable.name,
      description: servicesTable.description,
      amount: servicesTable.amount,
      pointsEarned: servicesTable.pointsEarned,
      createdAt: servicesTable.createdAt,
    })
    .from(servicesTable)
    .leftJoin(customersTable, eq(servicesTable.customerId, customersTable.id))
    .orderBy(desc(servicesTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      description: r.description ?? null,
      customerName: r.customerName ?? null,
    })),
  );
});

router.post(
  "/admin/customers/:customerId/services",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = AddServiceParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = AddServiceBody.safeParse(req.body);
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

    const amount = Number(parsed.data.amount);
    const pointsEarned =
      parsed.data.customPoints != null
        ? parsed.data.customPoints
        : calcPointsFromAmount(amount);

    const [service] = await db
      .insert(servicesTable)
      .values({
        customerId: params.data.customerId,
        name: parsed.data.name,
        description: parsed.data.description,
        amount: String(amount),
        pointsEarned,
      })
      .returning();

    // Award points to customer
    const newPoints = customer.totalPoints + pointsEarned;
    const newSpent = Number(customer.totalSpent) + amount;
    const newServicesCount = customer.servicesCount + 1;
    const newMembership = getMembershipLevel(newPoints);

    await db
      .update(customersTable)
      .set({
        totalPoints: newPoints,
        totalSpent: String(newSpent),
        servicesCount: newServicesCount,
        membershipLevel: newMembership,
      })
      .where(eq(customersTable.id, params.data.customerId));

    // Record point transaction
    await db.insert(pointTransactionsTable).values({
      customerId: params.data.customerId,
      points: pointsEarned,
      type: "earn",
      reason: `Service: ${parsed.data.name}`,
      serviceId: service.id,
    });

    res.status(201).json({
      ...service,
      amount: Number(service.amount),
      description: service.description ?? null,
      customerName: customer.name,
    });
  },
);

export { router as servicesRouter };
export default router;
