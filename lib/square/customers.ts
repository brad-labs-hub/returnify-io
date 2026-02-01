import { customersApi, generateIdempotencyKey } from './client';
import { createClient } from '@/lib/supabase/server';
import type { SquareCustomer, SquareApiResponse } from '@/types/square.types';

export async function createSquareCustomer(
  userId: string,
  email: string,
  fullName?: string,
  phone?: string
): Promise<SquareApiResponse<SquareCustomer>> {
  try {
    const nameParts = fullName?.split(' ') || [];
    const givenName = nameParts[0] || '';
    const familyName = nameParts.slice(1).join(' ') || '';

    const response = await customersApi.create({
      idempotencyKey: generateIdempotencyKey(),
      givenName,
      familyName,
      emailAddress: email,
      phoneNumber: phone,
      referenceId: userId, // Link to Supabase user ID
    });

    if (response.customer) {
      const customer = response.customer;

      // Update Supabase profile with Square customer ID
      const supabase = await createClient();
      await supabase
        .from('profiles')
        .update({ square_customer_id: customer.id })
        .eq('id', userId);

      return {
        success: true,
        data: {
          id: customer.id!,
          givenName: customer.givenName ?? undefined,
          familyName: customer.familyName ?? undefined,
          emailAddress: customer.emailAddress ?? undefined,
          phoneNumber: customer.phoneNumber ?? undefined,
          createdAt: customer.createdAt ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Failed to create customer',
    };
  } catch (error: unknown) {
    console.error('Square createCustomer error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to create customer',
    };
  }
}

export async function getSquareCustomer(
  customerId: string
): Promise<SquareApiResponse<SquareCustomer>> {
  try {
    const response = await customersApi.get({ customerId });

    if (response.customer) {
      const customer = response.customer;
      return {
        success: true,
        data: {
          id: customer.id!,
          givenName: customer.givenName ?? undefined,
          familyName: customer.familyName ?? undefined,
          emailAddress: customer.emailAddress ?? undefined,
          phoneNumber: customer.phoneNumber ?? undefined,
          createdAt: customer.createdAt ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Customer not found',
    };
  } catch (error: unknown) {
    console.error('Square getCustomer error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to get customer',
    };
  }
}

export async function getOrCreateSquareCustomer(
  userId: string,
  email: string,
  fullName?: string,
  phone?: string
): Promise<SquareApiResponse<SquareCustomer>> {
  // First check if user already has a Square customer ID
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('square_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.square_customer_id) {
    // Customer exists, retrieve from Square
    const existingCustomer = await getSquareCustomer(profile.square_customer_id);
    if (existingCustomer.success) {
      return existingCustomer;
    }
    // If retrieval fails, create a new customer
  }

  // Create new customer
  return createSquareCustomer(userId, email, fullName, phone);
}

export async function updateSquareCustomer(
  customerId: string,
  updates: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    phoneNumber?: string;
  }
): Promise<SquareApiResponse<SquareCustomer>> {
  try {
    const response = await customersApi.update({ customerId, ...updates });

    if (response.customer) {
      const customer = response.customer;
      return {
        success: true,
        data: {
          id: customer.id!,
          givenName: customer.givenName ?? undefined,
          familyName: customer.familyName ?? undefined,
          emailAddress: customer.emailAddress ?? undefined,
          phoneNumber: customer.phoneNumber ?? undefined,
          createdAt: customer.createdAt ?? undefined,
        },
      };
    }

    return {
      success: false,
      error: 'Failed to update customer',
    };
  } catch (error: unknown) {
    console.error('Square updateCustomer error:', error);
    const apiError = error as { errors?: Array<{ detail: string }> };
    return {
      success: false,
      error: apiError.errors?.[0]?.detail || 'Failed to update customer',
    };
  }
}
