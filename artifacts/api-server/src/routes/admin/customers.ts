import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import {
  CreateCustomerBody,
  UpdateCustomerBody,
  UpdateCustomerParams,
  GetCustomerParams,
} from "@workspace/api-zod";
import { requireAuth } from "../../lib/auth";
import { getMembershipLevel } from "../../lib/membership";
import { nanoid } from "nanoid";

const router: IRouter = Router();

function generateReferralCode(): string {
  return nanoid(8).toUpperCase();
}

function formatCustomer(c: any) {
  return {
    ...c,
    totalSpent: Number(c.totalSpent),
    clerkUserId: c.clerkUserId ?? null,
    phone: c.phone ?? null,
    referredByCode: c.referredByCode ?? null,
  };
}

router.get("/admin/customers", requireAuth, async (req, res): Promise<void> => {
  const customers = await db.select().from(customersTable).orderBy(customersTable.createdAt);
  res.json(customers.map(formatCustomer));
});

router.post("/admin/customers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const referralCode = generateReferralCode();
  const [customer] = await db
    .insert(customersTable)
    .values({ ...parsed.data, referralCode })
    .returning();

  res.status(201).json(formatCustomer(customer));
});

router.get("/admin/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(formatCustomer(customer));
});

router.patch("/admin/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .update(customersTable)
    .set(parsed.data)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(formatCustomer(customer));
});

export default router;
