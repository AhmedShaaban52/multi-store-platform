export const PLAN_LIMIT_KEY = 'planLimit';
export type LimitedResource = 'products';

export const PLAN_LIMITS: Record<string, Record<LimitedResource, number>> = {
  free: { products: 20 },
  pro: { products: 500 },
  enterprise: { products: Number.POSITIVE_INFINITY },
};