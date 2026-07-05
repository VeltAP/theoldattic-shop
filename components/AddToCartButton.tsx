'use client';

import { useCart } from '@/context/CartContext';

type AddToCartButtonProps = {
  productId: number;
  name: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  disabled?: boolean;
};

export default function AddToCartButton({
  productId,
  name,
  price,
  categoryId,
  imageUrl,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          productId : productId.toString(),
          name,
          price,
          categoryId,
          imageUrl,
        })
      }
      disabled={disabled}
      className="bg-shop-accent text-white px-6 py-3 rounded disabled:opacity-50"
    >
      Add to Cart
    </button>
  );
}