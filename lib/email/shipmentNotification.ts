import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const CARRIER_TRACKING_URLS: Record<string, (tracking: string) => string> = {
  'DHL': (t) => `https://www.dhl.com/track?tracking-id=${t}`,
  'GLS': (t) => `https://gls-group.com/track?match=${t}`,
  'Pošta Slovenije': (t) => `https://sledenje.posta.si/${t}`,
  'DPD': (t) => `https://www.dpd.com/track?parcelNumber=${t}`,
  'UPS': (t) => `https://www.ups.com/track?tracknum=${t}`,
  'FedEx': (t) => `https://www.fedex.com/apps/fedextrack/?tracknumbers=${t}`,
};

export async function sendShipmentEmail(order: {
  id: number;
  customer_email: string;
  tracking_number: string;
  carrier: string | null;
  order_items: { quantity: number; products: { name: string } }[];
}) {
  const itemsList = order.order_items
    .map((item) => `<li>${item.quantity} × ${item.products.name}</li>`)
    .join('');

  await resend.emails.send({
    from: 'The Old Attic <orders@theoldattic-shop.com>',
    to: [order.customer_email],
    subject: `Your order #${order.id} has shipped!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Your order is on its way</h1>
        <p>Order #${order.id} has shipped${order.carrier ? ` via ${order.carrier}` : ''}.</p>
        ${order.carrier && order.tracking_number ? `<p style="font-size: 18px;"><strong>Tracking number:</strong> <a href="${CARRIER_TRACKING_URLS[order.carrier]?.(order.tracking_number) ?? '#'}">${order.tracking_number}</a></p>` : ''}
        ${!order.carrier && order.tracking_number ? `<p style="font-size: 18px;"><strong>Tracking number:</strong> ${order.tracking_number}</p>` : ''}
        <p>Items in this shipment:</p>
        <ul>${itemsList}</ul>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          You can also check this order anytime at
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order-status">${process.env.NEXT_PUBLIC_SITE_URL}/order-status</a>.
        </p>
      </div>
    `,
  });
}