import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { servicesTable } from "./services";

export const pointTransactionsTable = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  type: text("type").notNull(), // earn | deduct | referral_bonus
  reason: text("reason").notNull(),
  serviceId: integer("service_id").references(() => servicesTable.id, { onDelete: "set null" }),
  referralId: integer("referral_id"), // soft ref, set after referrals table
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactionsTable.$inferSelect;
