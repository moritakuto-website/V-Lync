export type PlanId = "starter" | "standard" | "pro" | "max";

export type Plan = {
    id: PlanId;
    name: string;
    price: number;
    dailyLimit: number;
    label: string;
    recommended?: boolean;
    popular?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
    starter: {
        id: "starter",
        name: "Starter",
        price: 14800,
        dailyLimit: 20,
        label: "小規模運用向け",
    },
    standard: {
        id: "standard",
        name: "Standard",
        price: 29800,
        dailyLimit: 50,
        label: "推奨プラン",
        recommended: true,
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 59800,
        dailyLimit: 100,
        label: "人気プラン",
        popular: true,
    },
    max: {
        id: "max",
        name: "Max",
        price: 119800,
        dailyLimit: 200,
        label: "大規模運用",
    },
};
