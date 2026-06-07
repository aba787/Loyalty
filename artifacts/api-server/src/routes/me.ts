import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, servicesTable, pointTransactionsTable, referralsTable, commissionsTable } from "@workspace/db";
import { requireAuth, getClerkUserId } from "../lib/auth";
import { getDiscountTiers, getAvailableDiscount } from "../lib/membership";

const router: IRouter = Router();

async function getCustomerByClerkId(clerkUserId: string) {
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.clerkUserId, clerkUserId));
  return customer;
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

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.status(404).json({ error: "Customer not linked" });
    return;
  }
  res.json(formatCustomer(customer));
});

router.get("/me/profile", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.status(404).json({ error: "Customer not linked" });
    return;
  }
  res.json(formatCustomer(customer));
});

router.get("/me/services", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.json([]);
    return;
  }

  const rows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.customerId, customer.id))
    .orderBy(desc(servicesTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      description: r.description ?? null,
      customerName: customer.name,
    })),
  );
});

router.get("/me/points", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.json([]);
    return;
  }

  const rows = await db
    .select()
    .from(pointTransactionsTable)
    .where(eq(pointTransactionsTable.customerId, customer.id))
    .orderBy(desc(pointTransactionsTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      customerName: customer.name,
      serviceId: r.serviceId ?? null,
      referralId: r.referralId ?? null,
    })),
  );
});

router.get("/me/referrals", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.json([]);
    return;
  }

  const rows = await db
    .select()
    .from(referralsTable)
    .where(eq(referralsTable.referrerId, customer.id))
    .orderBy(desc(referralsTable.createdAt));

  const referredIds = rows.map((r) => r.referredId);
  const referredCustomers =
    referredIds.length > 0
      ? await db.select().from(customersTable)
      : [];
  const referredMap = new Map(referredCustomers.map((c) => [c.id, c.name]));

  res.json(
    rows.map((r) => ({
      ...r,
      rewardValue: Number(r.rewardValue),
      referrerName: customer.name,
      referredName: referredMap.get(r.referredId) ?? null,
    })),
  );
});

router.get("/me/commissions", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  if (!customer) {
    res.json([]);
    return;
  }

  const rows = await db
    .select()
    .from(commissionsTable)
    .where(eq(commissionsTable.customerId, customer.id))
    .orderBy(desc(commissionsTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      customerName: customer.name,
    })),
  );
});

router.get("/me/discounts", requireAuth, async (req, res): Promise<void> => {
  const clerkUserId = getClerkUserId(req)!;
  const customer = await getCustomerByClerkId(clerkUserId);
  const points = customer?.totalPoints ?? 0;

  res.json({
    currentPoints: points,
    availableDiscount: getAvailableDiscount(points),
    discountTiers: getDiscountTiers(points),
  });
});

export default router;
