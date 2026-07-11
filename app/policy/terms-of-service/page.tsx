import PolicyLayout from "@/components/PolicyLayout";

export default function TermsOfServicePage() {
  return (
    <PolicyLayout title="Terms of Service" lastUpdated="July 11, 2026">
      <p>
        These terms govern your use of this website and any purchase made
        through it. By browsing or ordering from us, you agree to the terms
        below.
      </p>

      <h2>About Our Products</h2>
      <p>
        We sell genuine vintage furniture and décor. Each item is unique,
        sold in the condition described and photographed, and once sold is
        removed from the site — we don&apos;t restock the same piece twice.
        Colors may vary slightly from photos due to lighting and screen
        settings.
      </p>

      <h2>Orders & Payment</h2>
      <p>
        All payments are processed securely through Stripe. By placing an
        order, you confirm that the payment details provided are your own
        and that you&apos;re authorized to use them. We reserve the right to
        cancel and refund any order we&apos;re unable to fulfill, for example if
        an item was sold as part of a simultaneous order.
      </p>

      <h2>Pricing</h2>
      <p>
        All prices are listed in euros and include applicable taxes unless
        stated otherwise. Shipping costs are calculated separately at
        checkout, based on your destination and the items in your cart. We
        reserve the right to correct pricing errors before an order is
        confirmed.
      </p>

      <h2>Shipping & Returns</h2>
      <p>
        Shipping timelines and costs are described in our{" "}
        <a href="/shipping-policy">Shipping Policy</a>. Our approach to
        returns and refunds is described in our{" "}
        <a href="/returns-policy">Returns & Refunds</a> policy. Both are
        part of these terms.
      </p>

      <h2>Use of This Website</h2>
      <p>
        You agree not to misuse this site — including attempting to
        interfere with its normal operation, accessing areas you&apos;re not
        authorized to access, or using the site for any unlawful purpose.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All text, photos, and design on this site belong to us and may not
        be copied or reused without permission.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        We aren&apos;t liable for indirect or incidental damages arising from
        your use of this site or purchase of our products, beyond the value
        of the order itself, to the extent permitted by law.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. The date at the top of
        this page reflects the most recent revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </PolicyLayout>
  );
}