export type SubscriptionPlan = "free" | "bronze" | "silver" | "gold";

export interface SubscriptionPlanConfig {
  name: string;
  price: number;
  currency: string;
  billingInterval: "monthly";
  postLimit: number | null;
}

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  SubscriptionPlanConfig
> = {
  free: {
    name: "Free",
    price: 0,
    currency: "INR",
    billingInterval: "monthly",
    postLimit: 1,
  },

  bronze: {
    name: "Bronze",
    price: 100,
    currency: "INR",
    billingInterval: "monthly",
    postLimit: 3,
  },

  silver: {
    name: "Silver",
    price: 300,
    currency: "INR",
    billingInterval: "monthly",
    postLimit: 5,
  },

  gold: {
    name: "Gold",
    price: 1000,
    currency: "INR",
    billingInterval: "monthly",
    postLimit: null,
  },
};
