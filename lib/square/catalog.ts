import { catalogApi, generateIdempotencyKey, dollarsToCents } from './client';
import { createClient } from '@/lib/supabase/server';
import type { SquareApiResponse, SubscriptionPlanMapping } from '@/types/square.types';

// Sync subscription plans from Supabase to Square Catalog
export async function syncSubscriptionPlans(): Promise<SquareApiResponse<SubscriptionPlanMapping[]>> {
  try {
    const supabase = await createClient();

    // Get all subscription plans from database
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (error || !plans) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch plans from database',
      };
    }

    const mappings: SubscriptionPlanMapping[] = [];

    for (const plan of plans) {
      // Check if plan already exists in Square
      if (plan.square_catalog_object_id) {
        // Plan already synced, get the variation ID
        const existing = await getCatalogObject(plan.square_catalog_object_id);
        if (existing.success && existing.data) {
          mappings.push({
            dbPlanId: plan.id,
            dbPlanName: plan.name,
            squareCatalogObjectId: plan.square_catalog_object_id,
            squarePlanVariationId: plan.square_plan_variation_id || '',
            priceInCents: Math.round(plan.price * 100),
            cadence: 'MONTHLY',
          });
          continue;
        }
      }

      // Create new plan in Square Catalog
      const result = await createSubscriptionPlanInCatalog(
        plan.name,
        plan.price,
        plan.description || ''
      );

      if (result.success && result.data) {
        // Update database with Square IDs
        await supabase
          .from('subscription_plans')
          .update({
            square_catalog_object_id: result.data.catalogObjectId,
            square_plan_variation_id: result.data.planVariationId,
          })
          .eq('id', plan.id);

        mappings.push({
          dbPlanId: plan.id,
          dbPlanName: plan.name,
          squareCatalogObjectId: result.data.catalogObjectId,
          squarePlanVariationId: result.data.planVariationId,
          priceInCents: Math.round(plan.price * 100),
          cadence: 'MONTHLY',
        });
      }
    }

    return {
      success: true,
      data: mappings,
    };
  } catch (error: unknown) {
    console.error('Square syncSubscriptionPlans error:', error);
    return {
      success: false,
      error: 'Failed to sync subscription plans',
    };
  }
}

// Create a subscription plan in Square Catalog
async function createSubscriptionPlanInCatalog(
  name: string,
  priceInDollars: number,
  description: string
): Promise<SquareApiResponse<{ catalogObjectId: string; planVariationId: string }>> {
  try {
    const idempotencyKey = generateIdempotencyKey();
    const planId = `#plan_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const variationId = `#variation_${name.toLowerCase().replace(/\s+/g, '_')}`;

    const response = await catalogApi.object.upsert({
      idempotencyKey,
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: planId,
        subscriptionPlanData: {
          name,
          eligibleItemIds: [],
          eligibleCategoryIds: [],
          allItems: true,
          subscriptionPlanVariations: [
            {
              type: 'SUBSCRIPTION_PLAN_VARIATION',
              id: variationId,
              subscriptionPlanVariationData: {
                name: `${name} - Monthly`,
                phases: [
                  {
                    cadence: 'MONTHLY',
                    periods: 0, // 0 = infinite
                    recurringPriceMoney: {
                      amount: dollarsToCents(priceInDollars),
                      currency: 'USD',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    if (response.catalogObject) {
      const catalogObject = response.catalogObject as {
        id?: string;
        subscriptionPlanData?: {
          subscriptionPlanVariations?: Array<{ id?: string }>;
        };
      };
      const planVariation = catalogObject.subscriptionPlanData?.subscriptionPlanVariations?.[0];

      return {
        success: true,
        data: {
          catalogObjectId: catalogObject.id!,
          planVariationId: planVariation?.id || '',
        },
      };
    }

    return {
      success: false,
      error: 'Failed to create subscription plan',
    };
  } catch (error: unknown) {
    console.error('Square createSubscriptionPlanInCatalog error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to create subscription plan',
    };
  }
}

// Get a catalog object by ID
async function getCatalogObject(
  objectId: string
): Promise<SquareApiResponse<{ id: string; type: string }>> {
  try {
    const response = await catalogApi.object.get({ objectId });

    if (response.object) {
      return {
        success: true,
        data: {
          id: response.object.id!,
          type: response.object.type!,
        },
      };
    }

    return {
      success: false,
      error: 'Catalog object not found',
    };
  } catch (error: unknown) {
    console.error('Square getCatalogObject error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to get catalog object',
    };
  }
}

// Get plan variation ID for a subscription plan from database
export async function getPlanVariationId(planId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('square_plan_variation_id')
    .eq('id', planId)
    .single();

  return plan?.square_plan_variation_id || null;
}
