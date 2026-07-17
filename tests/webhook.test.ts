import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const constructEventMock = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => constructEventMock(...args),
    },
  },
}));

const maybeSingleMock = vi.fn();
const insertOrderMock = vi.fn();
const insertOrderItemsMock = vi.fn();
const updateProductMock = vi.fn();

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: maybeSingleMock,
            }),
          }),
          insert: (...args: unknown[]) => {
            insertOrderMock(...args);
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({ data: { id: 1, customer_email: 'test@example.com' } }),
              }),
            };
          },
        };
      }
      if (table === 'order_items') {
        return { insert: (...args: unknown[]) => insertOrderItemsMock(...args) };
      }
      if (table === 'products') {
        return {
          update: () => ({
            eq: (...args: unknown[]) => updateProductMock(...args),
          }),
        };
      }
      return {};
    },
  },
}));

vi.mock('@/lib/email/orderConfirmation', () => ({
  sendOrderConfirmationEmail: vi.fn(),
}));

import { POST } from '../app/api/webhooks/stripe/route';

function makeRequest(body: string, signature = 'valid-signature') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  });
}

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when the signature is invalid', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await POST(makeRequest('{}', 'bad-signature'));

    expect(response.status).toBe(400);
  });

  it('does not create a duplicate order for a session already processed', async () => {
    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer_details: { email: 'test@example.com', phone: null, address: null },
          amount_subtotal: 1000,
          amount_total: 1000,
          metadata: { cart: '[]' },
        },
      },
    });

    // simulate: this session was already processed before
    maybeSingleMock.mockResolvedValue({ data: { id: 1 } });

    await POST(makeRequest('{}'));

    expect(insertOrderMock).not.toHaveBeenCalled();
  });

  it('creates an order for a new session', async () => {
    constructEventMock.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_new',
          customer_details: { email: 'test@example.com', phone: null, address: null },
          amount_subtotal: 1000,
          amount_total: 1000,
          metadata: { cart: '[]' },
        },
      },
    });

    // simulate: no existing order found for this session
    maybeSingleMock.mockResolvedValue({ data: null });

    await POST(makeRequest('{}'));

    expect(insertOrderMock).toHaveBeenCalledTimes(1);
  });
});