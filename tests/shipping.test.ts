import { describe, it, expect } from 'vitest';
import { calculateShipping } from '../lib/shipping';

describe('calculateShipping', () => {
  it('sums rates for multiple items and quantities', () => {
    const rates = [
      { categoryId: 1, zoneId: 3, rate: 18 },
      { categoryId: 6, zoneId: 3, rate: 110 },
    ];
    const items = [
      { productId: 'a', categoryId: 1, quantity: 1 },
      { productId: 'b', categoryId: 6, quantity: 1 },
    ];
    expect(calculateShipping(items, 3, rates)).toBe(128);
  });

  it('returns 0 for a missing rate instead of throwing', () => {
    expect(calculateShipping([{ productId: 'a', categoryId: 99, quantity: 1 }], 3, [])).toBe(0);
  });

  it('multiplies rate by quantity for a single item', () => {
    const rates = [{ categoryId: 1, zoneId: 1, rate: 5 }];
    const items = [{ productId: 'a', categoryId: 1, quantity: 3 }];
    expect(calculateShipping(items, 1, rates)).toBe(15);
  });
});