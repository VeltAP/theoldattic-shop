import PolicyLayout from "@/components/PolicyLayout";

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy" lastUpdated="July 11, 2026">
      <p>
        We ship vintage furniture and décor across Slovenia, the EU, and
        worldwide. Because our pieces vary widely in size and weight,
        shipping costs are calculated based on both the destination and the
        category of item, and shown to you at checkout before you pay.
      </p>

      <h2>Shipping Zones</h2>
      <p>Every order falls into one of three zones:</p>
      <ul>
        <li><strong>Slovenia</strong> — domestic delivery.</li>
        <li><strong>EU</strong> — all other European Union member states.</li>
        <li><strong>Worldwide</strong> — everywhere else.</li>
      </ul>
      <p>
        Your shipping cost is calculated automatically on the cart page once
        you select your country, based on your zone and the category of each
        item in your cart.
      </p>

      <h2>Processing Time</h2>
      <p>
        Since every piece we sell is a unique, one-of-a-kind vintage item,
        orders are packed by hand with extra care. Please allow 2–5 business
        days for your order to be processed and handed to the courier before
        it ships.
      </p>

      <h2>Delivery Time</h2>
      <ul>
        <li>Slovenia: 1–3 business days after dispatch.</li>
        <li>EU: 3–7 business days after dispatch.</li>
        <li>Worldwide: 7–21 business days after dispatch, depending on destination and customs.</li>
      </ul>
      <p>
        These are estimates, not guarantees. Larger furniture pieces (such as
        cabinets and tables) may take longer due to freight logistics.
      </p>

      <h2>Customs & Import Duties</h2>
      <p>
        For orders shipped outside the EU, the recipient is responsible for
        any customs duties, import taxes, or fees charged by their country.
        These are not included in your order total and are collected by the
        courier or local customs authority on delivery.
      </p>

      <h2>Damaged in Transit</h2>
      <p>
        We package every item carefully, but vintage pieces can occasionally
        be damaged during shipping. If your order arrives damaged, please
        contact us within 48 hours of delivery with photos of the item and
        packaging, and we&apos;ll work with you on a resolution.
      </p>

      <h2>Questions</h2>
      <p>
        If you have any questions about shipping to your location, reach out
        through our <a href="/contact">Contact page</a> before placing an
        order.
      </p>
    </PolicyLayout>
  );
}