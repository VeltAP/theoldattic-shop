import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type Order = {
  id: number;
  customer_email: string;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  subtotal: number | null;
  total: number | null;
};

function renderOrderEmailHtml(order: Order, items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0;">${item.name}</td>
          <td style="padding: 8px 0; text-align: center;">${item.qty}</td>
          <td style="padding: 8px 0; text-align: right;">€${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Thank you for your order!</h1>
      <p>Order #${order.id}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px 0;">Item</th>
            <th style="text-align: center; padding: 8px 0;">Qty</th>
            <th style="text-align: right; padding: 8px 0;">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p><strong>Total: €${(order.total ?? 0).toFixed(2)}</strong></p>

      <h2 style="font-size: 16px; margin-top: 30px;">Shipping to</h2>
      <p>
        ${order.shipping_address_line1 ?? ''}<br />
        ${order.shipping_address_line2 ? order.shipping_address_line2 + '<br />' : ''}
        ${order.shipping_city ?? ''} ${order.shipping_postal_code ?? ''}<br />
        ${order.shipping_country ?? ''}
      </p>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        We'll send tracking info once your order ships. Questions? Just reply to this email.
      </p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: Order, items: OrderItem[]) {
  await resend.emails.send({
    from: 'The Old Attic <orders@theoldattic-shop.com>',
    to: [order.customer_email],
    subject: `Your order confirmation — The Old Attic (#${order.id})`,
    html: renderOrderEmailHtml(order, items),
  });
}