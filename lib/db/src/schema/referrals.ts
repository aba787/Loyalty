import { pgTable, serial, timestamp, integer, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  referredId: integer("referred_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending | confirmed | rejected
  rewardType: text("reward_type").notNull().default("points"), // points | percentage
  rewardValue: numeric("reward_value", { precision: 10, scale: 2 }).notNull().default("100"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
