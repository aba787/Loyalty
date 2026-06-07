import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, referralsTable, pointTransactionsTable, commissionsTable } from "@workspace/db";
import { UpdateReferralBody, UpdateReferralParams } from "@workspace/api-zod";
import { requireAuth } from "../../lib/auth";
import { getMembershipLevel } from "../../lib/membership";

const router: IRouter = Router();

async function getReferralsWithNames() {
  const referrers = db
    .select({ id: customersTable.id, name: customersTable.name })
    .from(customersTable)
    .as("referrers");
  const referred = db
    .select({ id: customersTable.id, name: customersTable.name })
    .from(customersTable)
    .as("referred");

  const rows = await db.select().from(referralsTable).orderBy(desc(referralsTable.createdAt));
  const customers = await db.select().from(customersTable);
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  return rows.map((r) => ({
    ...r,
    rewardValue: Number(r.rewardValue),
    referrerName: customerMap.get(r.referrerId) ?? null,
    referredName: customerMap.get(r.referredId) ?? null,
  }));
}

router.get("/admin/referrals", requireAuth, async (_req, res): Promise<void> => {
  const rows = await getReferralsWithNames();
  res.json(rows);
});

router.patch("/admin/referrals/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateReferralParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReferralBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(referralsTable)
    .where(eq(referralsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Referral not found" });
    return;
  }

  const wasConfirmed = existing.status === "confirmed";
  const nowConfirmed = parsed.data.status === "confirmed";

  const [updated] = await db
    .update(referralsTable)
    .set(parsed.data)
    .where(eq(referralsTable.id, params.data.id))
    .returning();

  // If just confirmed → award points / commission to referrer
  if (!wasConfirmed && nowConfirmed) {
    const [referrer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, existing.referrerId));

    if (referrer) {
      const rewardValue = Number(existing.rewardValue);

      if (existing.rewardType === "points") {
        const bonusPoints = Math.floor(rewardValue);
        const newPoints = referrer.totalPoints + bonusPoints;
        const newMembership = getMembershipLevel(newPoints);

        await db
          .update(customersTable)
          .set({ totalPoints: newPoints, referralCount: referrer.referralCount + 1, membershipLevel: newMembership })
          .where(eq(customersTable.id, referrer.id));

        await db.insert(pointTransactionsTable).values({
          customerId: referrer.id,
          points: bonusPoints,
          type: "referral_bonus",
          reason: `Referral bonus`,
          referralId: existing.id,
        });
      } else {
        // percentage commission
        await db
          .update(customersTable)
          .set({ referralCount: referrer.referralCount + 1 })
          .where(eq(customersTable.id, referrer.id));
      }

      // Create commission record
      await db.insert(commissionsTable).values({
        customerId: referrer.id,
        referralId: existing.id,
        amount: String(rewardValue),
        status: "pending",
      });
    }
  }

  const customers = await db.select().from(customersTable);
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  res.json({
    ...updated,
    rewardValue: Number(updated.rewardValue),
    referrerName: customerMap.get(updated.referrerId) ?? null,
    referredName: customerMap.get(updated.referredId) ?? null,
  });
});

export default router;
