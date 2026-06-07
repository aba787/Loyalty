import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, commissionsTable } from "@workspace/db";
import { UpdateCommissionBody, UpdateCommissionParams } from "@workspace/api-zod";
import { requireAuth } from "../../lib/auth";

const router: IRouter = Router();

router.get("/admin/commissions", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: commissionsTable.id,
      customerId: commissionsTable.customerId,
      customerName: customersTable.name,
      referralId: commissionsTable.referralId,
      amount: commissionsTable.amount,
      status: commissionsTable.status,
      createdAt: commissionsTable.createdAt,
    })
    .from(commissionsTable)
    .leftJoin(customersTable, eq(commissionsTable.customerId, customersTable.id))
    .orderBy(desc(commissionsTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      customerName: r.customerName ?? null,
    })),
  );
});

router.patch("/admin/commissions/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCommissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCommissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(commissionsTable)
    .set(parsed.data)
    .where(eq(commissionsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Commission not found" });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, updated.customerId));

  res.json({
    ...updated,
    amount: Number(updated.amount),
    customerName: customer?.name ?? null,
  });
});

export default router;
