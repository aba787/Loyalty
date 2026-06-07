export type MembershipLevel = "Bronze" | "Silver" | "Gold" | "Platinum";

export function getMembershipLevel(points: number): MembershipLevel {
  if (points >= 5000) return "Platinum";
  if (points >= 2000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

export function calcPointsFromAmount(amount: number): number {
  // 1 dollar = 1 point (floor)
  return Math.floor(amount);
}

export interface DiscountTier {
  pointsRequired: number;
  discountPercent: number;
  achieved: boolean;
}

export function getDiscountTiers(currentPoints: number): DiscountTier[] {
  return [
    { pointsRequired: 100, discountPercent: 5, achieved: currentPoints >= 100 },
    { pointsRequired: 500, discountPercent: 10, achieved: currentPoints >= 500 },
    { pointsRequired: 1000, discountPercent: 15, achieved: currentPoints >= 1000 },
  ];
}

export function getAvailableDiscount(currentPoints: number): number {
  if (currentPoints >= 1000) return 15;
  if (currentPoints >= 500) return 10;
  if (currentPoints >= 100) return 5;
  return 0;
}
